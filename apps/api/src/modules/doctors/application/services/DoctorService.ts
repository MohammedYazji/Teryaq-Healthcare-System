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

  // FETCH THE DOCTOR INFORMATION VIA ID
  async getProfileByUserId(userId: string) {
    const profile = await DoctorProfileModel.findOne({ userId })
      .populate("userId", "firstName lastName")
      .populate("specialization");

    if (!profile) throw new AppError("There's no profile for this user.", 404);
    return profile;
  }

  // UPDATE THE DOCTOR INFORMATION VIA ID
  async updateProfile(userId: string, updateData: Partial<IDoctorProfile>) {
    // get the user and update it
    const updatedProfile = await DoctorProfileModel.findOneAndUpdate(
      { userId },
      updateData,
      {
        returnDocument: "after", // return the doc after updating
        runValidators: true, // validate the new data
      },
    ).populate("specialization");

    if (!updatedProfile) {
      throw new AppError("Profile not found", 404);
    }

    return updatedProfile;
  }
}

export const doctorService = new DoctorService();
