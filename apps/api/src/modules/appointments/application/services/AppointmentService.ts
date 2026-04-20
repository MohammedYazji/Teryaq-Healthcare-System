import { AvailabilityModel } from "../../infrastructure/models/AvailabilityModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";
import { AppointmentModel } from "../../infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";
import { UserModel } from "../../../users/infrastructure/models/UserModel ";
import { Email } from "../../../../core/utils/email";
import { PatientProfileModel } from "../../../patients/infrastructure/models/PatientModel";

export class AppointmentService {
  // CORE LOGIC TO CREATE A NEW APPOINTMENT
  static async createAppointment(
    patientId: string,
    slotId: string,
    appointmentDate: string,
    reason?: string,
  ) {
    // CHECK IF THE SLOT EXISTS
    const slot = await AvailabilityModel.findById(slotId);

    if (!slot) {
      throw new AppError("The requested time slot does not exist", 404);
    }

    // CHECK IF THE SLOT IS STILL AVAILABLE
    if (!slot.isAvailable) {
      throw new AppError(
        "This slot has already been booked by someone else",
        400,
      );
    }

    // CHECK IF THE REQUESTED DATE MATCHES THE SLOT DAY
    const requestedDate = new Date(appointmentDate);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const requestedDayName = dayNames[requestedDate.getDay()];

    if (requestedDayName !== slot.dayOfWeek) {
       throw new AppError(`This slot is only available on ${slot.dayOfWeek}s. You provided a ${requestedDayName}.`, 400);
    }

    // FETCH THE DOCTOR TO GET THE FEE AS SNAPSHOT INSIDE THE APPOINTMENT DOCUMENT
    const doctor = await DoctorProfileModel.findOne({ _id: slot.doctorId }).populate(
      "userId",
      "firstName lastName email",
    );
    if (!doctor) throw new AppError("Doctor not found", 404);

    // UPDATE SLOT AVAILABILITY AND CREATE APPOINTMENT
    slot.isAvailable = false;
    await slot.save();

    try {
      const appointment = await AppointmentModel.create({
        patientId,
        doctorId: slot.doctorId,
        slotId: slot._id,
        appointmentDate: requestedDate, // Passed from request body
        appointmentTime: slot.startTime, // SNAPSHOT from slot
        status: "pending", // Waiting for doctor approval
        reason: reason || "Regular Checkup", // Optional from user input
        fee: doctor.consultationFee, // SNAPSHOT from doctor profile
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
          await new Email(doctorUser).sendNewAppointmentAlert(
            `${patientUser.firstName || "Valued"} ${patientUser.lastName || "Patient"}`,
            appointment.appointmentDate.toDateString(),
            appointment.appointmentTime,
          );
        }
      }

      return appointment;
    } catch (error: any) {
      // IF THE APPOINTMENT CREATION FAILS, MAKE THE SLOT AVAILABLE AGAIN
      slot.isAvailable = true;
      await slot.save();

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

    return await AppointmentModel.find(query)
      .populate({
        path: role === "doctor" ? "patientId" : "doctorId",
        select: "firstName lastName email phoneNumber photo",
      })
      .sort({ createdAt: -1 }); // Newest First
  }

  // UPDATE THE APPOINTMENT STATUS VIA THE DOCTOR
  static async updateStatus(
    appointmentId: string,
    doctorId: string,
    newStatus: "scheduled" | "cancelled",
    cancellationReason?: string,
  ) {
    // FETCH THE APPOINTMENT
    const appointment = await AppointmentModel.findOne({
      _id: appointmentId,
      doctorId,
    });

    if (!appointment) {
      throw new AppError(
        "Appointment not found or you do not have permission",
        404,
      );
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
        await new Email(patient.userId as any).sendAppointmentCancelled(
          appointment.cancellationReason,
        );
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
      const doctorProfile =
        await DoctorProfileModel.findById(doctorId).populate(
          "userId",
          "firstName lastName",
        );
      const doctorLastName =
        (doctorProfile?.userId as any)?.lastName || "Doctor";

      if (patient?.userId) {
        await new Email(patient.userId as any).sendAppointmentConfirmed(
          `Dr. ${doctorLastName}`,
          appointment.appointmentDate.toDateString(),
          appointment.appointmentTime,
        );
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
      isAvailable: true,
    });

    // Lock the new slot
    newSlot.isAvailable = false;
    await newSlot.save();

    // Update the appointment details
    appointment.slotId = newSlot._id as any;
    appointment.appointmentTime = newSlot.startTime; // Update the snapshot
    appointment.status = "scheduled"; // Reset status to scheduled if it was pending
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
