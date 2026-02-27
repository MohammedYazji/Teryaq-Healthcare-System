import mongoose from "mongoose";
import { DoctorProfileModel } from "../../infrastructure/models/DoctorModel";
import { IDoctorProfile } from "../../domain/entities/IDoctorProfile";
import { AppError } from "../../../../core/errors/AppError";

class DoctorService {
  // CREATE A NEW DOCTOR PROFILE
  // ONLY VIA THE SIGNUP TRANSACTION
  async createProfile(
    data: Partial<IDoctorProfile>,
    session?: mongoose.ClientSession,
  ) {
    // CREATE THE PROFILE
    const [profile] = await DoctorProfileModel.create([data], { session });

    if (!profile) {
      throw new AppError("Failed to create doctor profile during signup", 400);
    }

    return profile;
  }
}

export const doctorService = new DoctorService();
