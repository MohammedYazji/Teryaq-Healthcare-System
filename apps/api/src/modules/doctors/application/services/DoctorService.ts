import mongoose from "mongoose";
import { DoctorProfileModel } from "../../infrastructure/models/DoctorModel";
import { IDoctorProfile } from "../../domain/entities/IDoctorProfile";
import { AppError } from "../../../../core/errors/AppError";
import { CloudinaryService } from "../../../../core/services/CloudinaryService";

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

  // FETCH ALL DOCTORS
  async getAllDoctors() {
    const doctors = await DoctorProfileModel.find()
      .populate("userId", "firstName lastName photo")
      .populate("specialization", "name icon");

    // RETURN JUST THE DOCTORS PROFILES IF THEIR USER ID IS ACTIVE
    return doctors.filter((doc) => doc.userId !== null);
  }

  // FETCH A DOCTOR USING THE DOCTOR ID
  async getDoctorById(id: string) {
    const doctor = await DoctorProfileModel.findById(id)
      .populate("userId", "firstName lastName photo email")
      .populate("specialization");

    if (!doctor) {
      throw new AppError("There's no doctor link with this ID", 404);
    }
    return doctor;
  }

  // UPLOAD A DOCTOR DOCUMENTS
  async uploadCertificates(doctorId: string, buffers: Buffer[]) {
    const uploadPromises = buffers.map((buffer) =>
      CloudinaryService.uploadStream(buffer, "doctors/certificates"),
    );

    const cloudinaryResults = await Promise.all(uploadPromises);

    const newDocs = cloudinaryResults.map((res) => ({
      name: "Medical Doc",
      url: res.secure_url,
      publicId: res.public_id,
    }));

    return await DoctorProfileModel.findOneAndUpdate(
      { userId: doctorId },
      { $push: { documents: { $each: newDocs } } },
      { returnDocument: "after", runValidators: true },
    );
  }
}

export const doctorService = new DoctorService();
