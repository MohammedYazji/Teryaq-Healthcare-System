import { IPatientProfile } from "./../../domain/entities/IPatientProfile";
import mongoose, { Schema, Document, Model, Query } from "mongoose";

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

// QUERY MIDDLEWARE
// TO FETCH THE USER INFORMATION
// BESIDE THE PATIENT INFORMATION
PatientSchema.pre(/^find/, function (this: Query<any, any>) {
  this.populate({
    path: "userId",
    select: "firstName lastName email",
  });
});

export const PatientProfileModel: Model<IPatientDocument> =
  mongoose.model<IPatientDocument>("PatientProfile", PatientSchema);
