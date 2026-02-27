import { Types } from "mongoose";

export interface IDoctorProfile {
  id?: string;
  userId?: Types.ObjectId;
  specialization?: Types.ObjectId;
  degree?: string;
  experienceYears?: number;
  bio?: string;
  consultationFee?: number;
  isVerified?: boolean;
}
