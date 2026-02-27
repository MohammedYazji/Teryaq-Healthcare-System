import { Types } from "mongoose";

export interface IPatientProfile {
  id?: string;
  userId?: Types.ObjectId;
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: string;
  emergencyContactPhone?: string;
}
