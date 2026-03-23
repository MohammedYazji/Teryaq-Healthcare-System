import { MedicalRecordModel } from "../../infrastructure/models/MedicalRecordModel";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { AppError } from "../../../../core/errors/AppError";
import { IMedicalRecord } from "../../domain/entities/IMedicalRecord";

export class MedicalRecordService {
  // Create a record after the session
  static async createRecord(doctorId: string, data: Partial<IMedicalRecord>) {
    if (!data.appointmentId) {
      throw new AppError("Appointment ID is required", 400);
    }

    // Ensure the appointment belong to this doctor and in-progress
    const appointment = await AppointmentModel.findOne({
      _id: data.appointmentId,
      doctorId,
    });

    if (!appointment)
      throw new AppError("Appointment not found or unauthorized", 404);

    // Allow just the confirmed or in-progress appointments
    const allowedStatuses = ["scheduled", "in-progress"];
    if (!allowedStatuses.includes(appointment.status)) {
      throw new AppError(
        `Cannot create a record for an appointment that is already ${appointment.status}`,
        400,
      );
    }

    // Prevent duplicate records
    const existing = await MedicalRecordModel.findOne({
      appointmentId: data.appointmentId,
    });
    if (existing)
      throw new AppError("Record already exists for this session", 400);

    // Create the record
    const record = await MedicalRecordModel.create({
      ...data,
      doctorId,
      patientId: appointment.patientId,
    });

    // Mark the appointment as completed
    appointment.status = "completed";
    await appointment.save();

    return record;
  }
}
