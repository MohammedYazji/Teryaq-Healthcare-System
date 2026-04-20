import mongoose, { Schema, Document, Model, Query } from "mongoose";
import { IDoctorProfile } from "../../domain/entities/IDoctorProfile";

export interface IDoctorDocument extends IDoctorProfile, Document {}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor profile must belong to a user"],
      unique: true,
    },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: [true, "Specilization is required"],
    },
    degree: {
      type: String,
      required: [true, "Degree is required"],
    },
    experienceYears: {
      type: Number,
      required: [true, "Experience years is required"],
    },
    bio: { type: String },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    averageRating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const DoctorProfileModel: Model<IDoctorDocument> =
  mongoose.model<IDoctorDocument>("DoctorProfile", DoctorSchema);
