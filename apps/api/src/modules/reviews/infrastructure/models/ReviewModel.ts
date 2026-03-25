import mongoose, { Schema, Document, Model } from "mongoose";
import { IReview } from "./../../domain/entities/IReview";

export interface IReviewDocument extends IReview, Document {}

const ReviewSchema: Schema<IReviewDocument> = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      required: [true, "Review comment cannot be empty"],
      trim: true,
    },
  },
  { timestamps: true },
);

export const ReviewModel: Model<IReviewDocument> =
  mongoose.model<IReviewDocument>("Review", ReviewSchema);
