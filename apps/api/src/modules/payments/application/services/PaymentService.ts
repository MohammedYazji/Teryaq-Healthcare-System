import Stripe from "stripe";
import { config } from "../../../../config/env";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";

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

    await AppointmentModel.findByIdAndUpdate(appointmentId, {
      isPaid: true,
      paymentStatus: "paid",
      status: "scheduled", // From Pending to scheduled
    });

    console.log(`Appointment ${appointmentId} has been paid and confirmed`);
  }
}
