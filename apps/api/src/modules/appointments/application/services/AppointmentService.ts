import { AvailabilityModel } from "../../infrastructure/models/AvailabilityModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";
import { AppointmentModel } from "../../infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";
import { UserModel } from "../../../users/infrastructure/models/UserModel ";
import { Email } from "../../../../core/utils/email";
import { PatientProfileModel } from "../../../patients/infrastructure/models/PatientModel";
import { PaymentService } from "../../../payments/application/services/PaymentService";

export class AppointmentService {
  // CORE LOGIC TO CREATE A NEW APPOINTMENT
  static async createAppointment(
    patientId: string,
    slotId: string,
    appointmentDate: string,
    reason?: string,
  ) {
    // CHECK IF THE REQUESTED DATE MATCHES A VALID DAY BEFORE CLAIMING THE SLOT
    const requestedDate = new Date(appointmentDate);
    const dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday",
    ];
    const requestedDayName = dayNames[requestedDate.getDay()];

    // ATOMICALLY CLAIM THE SLOT — only succeeds if it's available or an expired reservation
    const claimedSlot = await AvailabilityModel.findOneAndUpdate(
      {
        _id: slotId,
        $or: [
          { isAvailable: true },
          {
            status: "reserved",
            reservedUntil: { $lt: new Date() },
          },
        ],
      },
      {
        $set: {
          isAvailable: false,
          status: "reserved",
          reservedUntil: new Date(Date.now() + 15 * 60 * 1000),
        },
      },
      { new: true },
    );

    if (!claimedSlot) {
      throw new AppError(
        "This slot has already been booked or reserved by someone else",
        400,
      );
    }

    if (requestedDayName.toLowerCase() !== claimedSlot.dayOfWeek.toLowerCase()) {
      // Release the slot since the date is invalid
      await AvailabilityModel.findByIdAndUpdate(slotId, {
        isAvailable: true,
        status: "available",
        reservedUntil: null,
      });
      throw new AppError(
        `This slot is only available on ${claimedSlot.dayOfWeek}s. You provided a ${requestedDayName}.`,
        400,
      );
    }

    // FETCH THE DOCTOR TO GET THE FEE AS SNAPSHOT
    const doctor = await DoctorProfileModel.findOne({
      _id: claimedSlot.doctorId,
    }).populate("userId", "firstName lastName email");
    if (!doctor) {
      await AvailabilityModel.findByIdAndUpdate(slotId, {
        isAvailable: true,
        status: "available",
        reservedUntil: null,
      });
      throw new AppError("Doctor not found", 404);
    }

    // CANCEL OLD PENDING APPOINTMENTS FOR THIS SLOT/DATE (expired reservation)
    await AppointmentModel.updateMany(
      {
        slotId: claimedSlot._id,
        appointmentDate: requestedDate,
        status: { $in: ["pending", "pending-payment"] },
      },
      {
        status: "cancelled",
        cancellationReason: "Reservation expired and slot re-booked",
      },
    );

    try {
      const appointment = await AppointmentModel.create({
        patientId,
        doctorId: claimedSlot.doctorId,
        slotId: claimedSlot._id,
        appointmentDate: requestedDate,
        appointmentTime: claimedSlot.startTime,
        status: "pending",
        reason: reason || "Regular Checkup",
        fee: doctor.consultationFee,
      });

      // 1. Fetch and Populate
      const patientProfile =
        await PatientProfileModel.findById(patientId).populate("userId");

      // 2. Check if userId is actually an object (populated) and not just an ID string
      const patientUser =
        patientProfile?.userId && typeof patientProfile.userId === "object"
          ? (patientProfile.userId as any)
          : null;

      if (doctor.userId && patientUser) {
        const doctorUser = await UserModel.findById(doctor.userId);
        if (doctorUser) {
          try {
            await new Email(doctorUser).sendNewAppointmentAlert(
              `${patientUser.firstName || "Valued"} ${patientUser.lastName || "Patient"}`,
              appointment.appointmentDate.toDateString(),
              appointment.appointmentTime,
            );
          } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
          }
        }
      }

      return appointment;
    } catch (error: any) {
      // Release the slot if appointment creation fails
      await AvailabilityModel.findByIdAndUpdate(claimedSlot._id, {
        isAvailable: true,
        status: "available",
        reservedUntil: null,
      });
      throw new AppError(`Booking failed: ${error.message}`, 500);
    }
  }

  // FETCH THE USER APPOINTMENTS (FOR PATIENT AND DOCTOR)
  static async getUserAppointments(
    role: "doctor" | "patient",
    profileId: string,
  ) {
    const query =
      role === "doctor" ? { doctorId: profileId } : { patientId: profileId };

    const doctorPopulate = {
      path: "doctorId",
      populate: [
        { path: "userId", select: "firstName lastName email photo" },
        { path: "specialization", select: "name" },
      ],
    };

    const patientPopulate = {
      path: "patientId",
      populate: { path: "userId", select: "firstName lastName email photo" },
    };

    const appointments = await AppointmentModel.find(query)
      .populate(role === "doctor" ? patientPopulate : doctorPopulate)
      .populate("slotId")
      .sort({ createdAt: -1 }); // Newest First

    // Check Stripe for any unpaid appointments that have a session ID (catch missed webhooks)
    const unpaidIds = appointments
      .filter((a: any) => a.paymentStatus === "unpaid" && a.stripeSessionId)
      .map((a: any) => a._id.toString());

    if (unpaidIds.length) {
      const paymentService = new PaymentService();
      const confirmedIds = await paymentService.verifyPendingPayments(unpaidIds);
      if (confirmedIds.length) {
        // Re-fetch to return updated data
        return await AppointmentModel.find(query)
          .populate(role === "doctor" ? patientPopulate : doctorPopulate)
          .populate("slotId")
          .sort({ createdAt: -1 });
      }
    }

    return appointments;
  }

  // UPDATE THE APPOINTMENT STATUS VIA THE DOCTOR
  static async updateStatus(
    appointmentId: string,
    profileId: string,
    newStatus: "scheduled" | "cancelled" | "in-progress" | "completed",
    role: "doctor" | "patient",
    cancellationReason?: string,
  ) {
    // FETCH THE APPOINTMENT - match by doctorId or patientId based on role
    const query =
      role === "doctor"
        ? { _id: appointmentId, doctorId: profileId }
        : { _id: appointmentId, patientId: profileId };

    const appointment = await AppointmentModel.findOne(query);

    if (!appointment) {
      throw new AppError(
        "Appointment not found or you do not have permission",
        404,
      );
    }

    // IN-PROGRESS / COMPLETED - just update status, no slot changes
    if (newStatus === "in-progress" || newStatus === "completed") {
      appointment.status = newStatus;
      await appointment.save();
      return appointment;
    }

    // IF THE APPOINTMENT CANCELLED MAKE THE SLOT AVAILABLE AGAIN
    if (newStatus === "cancelled") {
      // 1. Free the slot
      await AvailabilityModel.findByIdAndUpdate(appointment.slotId, {
        isAvailable: true,
      });

      // 2. Save the cancellationReason in the DB
      appointment.cancellationReason =
        cancellationReason || "No reason provided by the doctor.";

      // 3. Notify the patient
      const patient = await PatientProfileModel.findById(
        appointment.patientId,
      ).populate("userId");
      if (patient?.userId) {
        try {
          await new Email(patient.userId as any).sendAppointmentCancelled(
            appointment.cancellationReason,
          );
        } catch (emailError) {
          console.error("Failed to send cancellation email:", emailError);
        }
      }
    }

    // IF THE APPOINTMENT SCHEDULED ENSURE THE SLOT STILL NOT AVAILABLE
    if (newStatus === "scheduled") {
      const slot = await AvailabilityModel.findById(appointment.slotId);

      // ENSURE NOBODY ELSE BOOKED THE SLOT
      // SO IF THE DOCTOR CANCELLED THE APPOINTMENT THEN SOMEBODY BOOKED
      // THE DOCTOR WILL NOT BE ABLE TO RE-SCHEDULE IT
      if (slot && !slot.isAvailable && appointment.status === "cancelled") {
        throw new AppError(
          "Cannot re-schedule; this slot has been taken by another patient",
          400,
        );
      }

      await AvailabilityModel.findByIdAndUpdate(appointment.slotId, {
        isAvailable: false,
      });

      // So if the doctor cancel it before then scheduled it again(remove the cancellationReason)
      appointment.cancellationReason = undefined;
    }

    // UPDATE THE APPOINTMENT STATUS
    appointment.status = newStatus;
    await appointment?.save();

    if (newStatus === "scheduled") {
      const patient = await PatientProfileModel.findById(
        appointment.patientId,
      ).populate("userId");
      const doctorProfile = await DoctorProfileModel.findById(
        profileId,
      ).populate("userId", "firstName lastName");
      const doctorLastName =
        (doctorProfile?.userId as any)?.lastName || "Doctor";

      if (patient?.userId) {
        try {
          await new Email(patient.userId as any).sendAppointmentConfirmed(
            `Dr. ${doctorLastName}`,
            appointment.appointmentDate.toDateString(),
            appointment.appointmentTime,
          );
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }
    }

    return appointment;
  }

  // FETCH SPECIFIC APPOINTMENT BY IT'S ID
  static async getAppointmentById(id: string, profileId: string, role: string) {
    // get the id of the another end to show his info with the appointment
    // Example: if patient use the service so will show the appointment and the doctor info
    const query =
      role === "doctor"
        ? { _id: id, doctorId: profileId }
        : { _id: id, patientId: profileId };

    const appointment = await AppointmentModel.findOne(query).populate({
      path: role === "doctor" ? "patientId" : "doctorId",
      select: "firstName lastName email phoneNumber photo",
    });

    if (!appointment) throw new AppError("Appointment not found", 404);
    return appointment;
  }

  // Reschedule THE APPOINTMENT WITH NEW AVAILABLE SLOT
  static async reschedule(
    appointmentId: string,
    profileId: string, // id of the person making the change
    role: "doctor" | "patient",
    newSlotId: string,
    newDate?: string,
  ) {
    // Fetch current appointment
    const query =
      role === "doctor"
        ? { _id: appointmentId, doctorId: profileId }
        : { _id: appointmentId, patientId: profileId };

    const appointment = await AppointmentModel.findById(query);
    if (!appointment)
      throw new AppError("Appointment not found or unauthorized", 404);

    // Fetch the new slot
    const newSlot = await AvailabilityModel.findById(newSlotId);
    if (!newSlot || !newSlot.isAvailable)
      throw new AppError("The new time slot is not available", 400);

    // Free the old slot
    await AvailabilityModel.findByIdAndUpdate(appointment.slotId, {
      status: "available",
      isAvailable: true,
      reservedUntil: null,
    });

    // Lock the new slot
    newSlot.isAvailable = false;
    newSlot.status = "booked";
    newSlot.reservedUntil = null;
    await newSlot.save();

    // Update the appointment details
    appointment.slotId = newSlot._id as any;
    appointment.appointmentTime = newSlot.startTime; // Update the snapshot
    if (newDate) appointment.appointmentDate = new Date(newDate); // Update the date
    appointment.status = role === "doctor" ? "scheduled" : "pending"; // Doctor reschedule keeps approved, patient needs re-approval
    appointment.cancellationReason = undefined; // Clear any old reasons

    await appointment.save();

    // Send Email
    try {
      const patientProfile = await PatientProfileModel.findById(
        appointment.patientId,
      ).populate("userId");
      const doctorProfile = await DoctorProfileModel.findById(
        appointment.doctorId,
      ).populate("userId");

      const patientUser = patientProfile?.userId as any;
      const doctorUser = doctorProfile?.userId as any;

      if (role === "doctor" && patientUser) {
        // if the doctor change the slot (send to patient)
        await new Email(patientUser).sendRescheduledNotification(
          `Dr. ${doctorUser?.lastName || "Doctor"}`,
          appointment.appointmentDate.toDateString(),
          appointment.appointmentTime,
        );
      } else if (role === "patient" && doctorUser) {
        // if the patient change the slot (send to doctor)
        await new Email(doctorUser).sendRescheduledNotification(
          `${patientUser?.firstName} ${patientUser?.lastName}`,
          appointment.appointmentDate.toDateString(),
          appointment.appointmentTime,
        );
      }
    } catch (error) {
      console.error(
        "Email notification failed but appointment was rescheduled:",
        error,
      );
    }

    return appointment;
  }
}
