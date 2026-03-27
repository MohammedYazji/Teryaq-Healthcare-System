import { AppError } from "../../../../core/errors/AppError";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";

export class AdminService {
  // Fetch all doctors wait verification their accounts & Have documents to review
  async getPendingDoctors() {
    return await DoctorProfileModel.find({
      isVerified: false,
      documents: { $exists: true, $not: { $size: 0 } },
    }).populate("userId", "firstName lastName email photo");
  }

  // Verify the doctor account
  async verifyDoctor(doctorId: string, isVerified: boolean) {
    const doctor = await DoctorProfileModel.findByIdAndUpdate(
      doctorId,
      { isVerified },
      { returnDocument: "after", runValidators: true },
    );

    if (!doctor) {
      throw new AppError("Doctor profile not found", 404);
    }

    return doctor;
  }
}

export const adminService = new AdminService();
