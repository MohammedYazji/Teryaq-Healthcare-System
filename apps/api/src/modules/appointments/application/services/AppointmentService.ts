import { AvailabilityModel } from "../../infrastructure/models/AvailabilityModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";
import { AppointmentModel } from "../../infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";

export class AppointmentService {
  // CORE LOGIC TO CREATE A NEW APPOINTMENT
  static async createAppointment(
    patientId: string,
    slotId: string,
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

    // FETCH THE DOCTOR TO GET THE FEE AS SNAPSHOT INSIDE THE APPOINTMENT DOCUMENT
    const doctor = await DoctorProfileModel.findOne({ _id: slot.doctorId });
    if (!doctor) throw new AppError("Doctor not found", 404);

    // UPDATE SLOT AVAILABILITY AND CREATE APPOINTMENT
    slot.isAvailable = false;
    await slot.save();

    try {
      const appointment = await AppointmentModel.create({
        patientId,
        doctorId: slot.doctorId,
        slotId: slot._id,
        appointmentDate: new Date(), // For now, we use current date; later we'll use actual calendar date
        appointmentTime: slot.startTime, // SNAPSHOT from slot
        status: "pending", // Waiting for doctor approval
        reason: reason || "Regular Checkup", // Optional from user input
        fee: doctor.consultationFee, // SNAPSHOT from doctor profile
      });

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
      await AvailabilityModel.findByIdAndUpdate(appointment.slotId, {
        isAvailable: true,
      });
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
    }

    // UPDATE THE APPOINTMENT STATUS
    appointment.status = newStatus;
    await appointment?.save();

    return appointment;
  }
}
