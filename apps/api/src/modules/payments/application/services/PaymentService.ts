import Stripe from "stripe";
import { config } from "../../../../config/env";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";
import { Email } from "../../../../core/utils/email";

const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {});

export class PaymentService {
  // CREATE A NEW SESSION FOR PAYMENT
  async createCheckoutSession(appointmentId: string, user: any) {
    // 1. Get the appointment & The Doctor Info
    const appointment =
      await AppointmentModel.findById(appointmentId).populate("doctorId");

    if (!appointment) throw new AppError("Appointment not found", 404);

    // 2. Create the payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // The URL which will redirect the user after he pays
      success_url: `${config.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.FRONTEND_URL}/payment-cancelled`,
      customer_email: user.email,
      // I will send this Id of the appointment with the stripe session, so then when return i will check the this appointment info in the database (check confirmPayment & handleExpiredSession)
      client_reference_id: appointmentId, // to link the payment with the appointment in the webhooks
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: appointment.fee * 100, // Stripe calc in cent
            product_data: {
              name: `Consultation with Dr. ${appointment.doctorId.userId.firstName}`,
              description: "Online medical consultation via Teryaq platform",
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
    });

    appointment.stripeSessionId = session.id;
    await appointment.save();

    return session;
  }

  // CONFIRM THE PAYING PROCESS AND CHANGE THE PAYMENT STATUS AND THE STATUS
  async confirmPayment(session: any) {
    const appointmentId = session.client_reference_id;

    const appointment = (await AppointmentModel.findById(appointmentId)
      .populate({ path: "patientId", populate: { path: "userId" } })
      .populate({ path: "doctorId", populate: { path: "userId" } })) as any;

    if (!appointment || appointment.isPaid) {
      console.log(
        `Appointment ${appointmentId} is already confirmed or not found.`,
      );
      return;
    }

    appointment.isPaid = true;
    appointment.paymentStatus = "paid";
    appointment.status = "scheduled";
    await appointment.save();

    // Send email to the user
    try {
      const email = new Email(appointment.patientId.userId);

      const doctorFullName = `Dr. ${appointment.doctorId.userId.firstName} ${appointment.doctorId.userId.lastName}`;
      const appointmentDate = appointment.appointmentDate.toDateString();
      const appointmentTime = appointment.appointmentTime;

      await email.sendAppointmentConfirmed(
        doctorFullName,
        appointmentDate,
        appointmentTime,
      );

      console.log(`Appointment ${appointmentId} has been paid and confirmed`);
      console.log(
        `Confirmation email sent to patient: ${appointment.patientId.userId.email}`,
      );
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  // HANDLE THE FAILURE IN PAY
  async handleExpiredSession(session: any) {
    const appointmentId = session.client_reference_id;

    await AppointmentModel.findByIdAndUpdate(appointmentId, {
      paymentStatus: "unpaid",
      status: "cancelled",
    });

    console.log(
      `Session expired for appointment ${appointmentId}. Slot released.`,
    );
  }
}
