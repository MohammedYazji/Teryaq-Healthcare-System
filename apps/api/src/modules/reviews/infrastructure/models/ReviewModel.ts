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

// STATIC METHOD TO CALC THE DOCTOR AVG RATING AND UPDATE HIS PROFILE
ReviewSchema.statics.calcAverageRatings = async function (
  doctorId: mongoose.Types.ObjectId,
) {
  const stats = await this.aggregate([
    {
      $match: { doctorId },
    },
    {
      $group: {
        _id: "$doctorId",
        nRating: { $sum: 1 }, // Ratings Count
        avgRating: { $avg: "$rating" }, // AVG
      },
    },
  ]);

  // UPDATE THE PROFILE WITH THE NEW RESULTS
  const DoctorProfile = mongoose.model("DoctorProfile");
  if (stats.length > 0) {
    await DoctorProfile.findByIdAndUpdate(doctorId, {
      numberOfReviews: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    // IF NO RATINGS => SET DEFAULT VALUES
    await DoctorProfile.findByIdAndUpdate(doctorId, {
      numberOfReviews: 0,
      averageRating: 4.5,
    });
  }
};

// RUN THE METHOD AFTER SAVING ANY NEW RATING
// To calc num and avg
ReviewSchema.post("save", function () {
  (this.constructor as any).calcAverageRatings(this.doctorId);
});

export const ReviewModel: Model<IReviewDocument> =
  mongoose.model<IReviewDocument>("Review", ReviewSchema);
