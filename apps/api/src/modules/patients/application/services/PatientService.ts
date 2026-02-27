import mongoose from "mongoose";
import { PatientProfileModel } from "../../infrastructure/models/PatientModel";
import { IPatientProfile } from "../../domain/entities/IPatientProfile";
import { AppError } from "../../../../core/errors/AppError";

class PatientService {
  // CREATE A NEW PATIENT PROFILE
  // ONLY VIA THE SIGNUP TRANSACTION
  async createProfile(
    data: Partial<IPatientProfile>,
    session?: mongoose.ClientSession,
  ) {
    // CREATE THE PROFILE
    const [newProfile] = await PatientProfileModel.create([data], { session });
    return newProfile;
  }

  // FETCH THE PATIENT INFORMATION VIA ID
  async getProfileByUserId(userId: string) {
    const profile = await PatientProfileModel.findOne({ userId }).populate(
      "userId",
      "firstName lastName",
    );

    if (!profile) throw new AppError("There's no profile for this user.", 404);
    return profile;
  }

  // UPDATE THE DOCTOR INFORMATION VIA ID
  async updateProfile(userId: string, updateData: Partial<IPatientProfile>) {
    // get the user and update it
    const updatedProfile = await PatientProfileModel.findOneAndUpdate(
      { userId },
      updateData,
      {
        returnDocument: "after", // return the doc after updating
        runValidators: true, // validate the new data
      },
    );

    if (!updatedProfile) {
      throw new AppError("Profile not found", 404);
    }

    return updatedProfile;
  }
}

export const patientService = new PatientService();
