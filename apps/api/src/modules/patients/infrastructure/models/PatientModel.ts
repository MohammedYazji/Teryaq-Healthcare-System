import { IPatientProfile } from "./../../domain/entities/IPatientProfile";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatientDocument extends IPatientProfile, Document {}

const PatientSchema: Schema<IPatientDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    allergies: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      type: String,
    },
    emergencyContactPhone: {
      type: String,
    },
  },
  { timestamps: true },
);

export const PatientProfileModel: Model<IPatientDocument> =
  mongoose.model<IPatientDocument>("PatientProfile", PatientSchema);
