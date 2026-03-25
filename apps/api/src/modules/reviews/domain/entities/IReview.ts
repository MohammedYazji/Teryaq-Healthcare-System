import mongoose from "mongoose";

export interface IReview {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  rating: number; // 1 - 5
  comment: string;
  createdAt: Date;
}
