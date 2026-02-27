import mongoose from "mongoose";
import { PatientProfileModel } from "../../infrastructure/models/PatientModel";
import { IPatientProfile } from "../../domain/entities/IPatientProfile";

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
}

export const patientService = new PatientService();
