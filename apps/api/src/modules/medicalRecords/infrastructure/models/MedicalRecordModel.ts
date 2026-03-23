import mongoose, { Document, Model, Schema } from "mongoose";
import { IMedicalRecord } from "./../../domain/entities/IMedicalRecord";

// IMedicalRecord IS THE ENTITY (TO MAKE TYPE CHECKING)
// DOCUMENT IS THE MONGODB DOCUMENT (TO MAKE MONGODB OPERATIONS)
// IMedicalRecordDocument IS THE COMBINATION OF IMedicalRecord AND DOCUMENT (TO MAKE TYPE CHECKING AND MONGODB OPERATIONS)
export interface IMedicalRecordDocument extends IMedicalRecord, Document {
  id: string;
}

const MedicalRecordSchema: Schema<IMedicalRecordDocument> = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Medical record must belong to an appointment"],
      unique: true, // One medical record for each appointment
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: [true, "Medical record must belong to a patient"],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: [true, "Medical record must belong to a doctor"],
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
      },
    ],
    notes: { type: String },
    attachments: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const MedicalRecordModel: Model<IMedicalRecordDocument> =
  mongoose.model<IMedicalRecordDocument>("MedicalRecord", MedicalRecordSchema);
