import { Types } from "mongoose";

export interface IDoctorDocument {
  name: string;
  url: string; // Cloudinary URL
  publicId: string; // FOR CONTROL AND DELETE
}

export interface IDoctorProfile {
  id?: string;
  userId?: Types.ObjectId;
  specialization?: Types.ObjectId;
  degree?: string;
  experienceYears?: number;
  bio?: string;
  consultationFee?: number;
  isVerified?: boolean;
  documents: IDoctorDocument[];
  averageRating?: number;
  numberOfReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
