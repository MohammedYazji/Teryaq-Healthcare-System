import { AppError } from "../../../../core/errors/AppError";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";
import { PatientProfileModel } from "../../../patients/infrastructure/models/PatientModel";
import { SpecializationModel } from "../../../specializations/infrastructure/models/SpecializationModel";

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

  // Fetch the stats for the admin dashboard
  async getDashboardStats() {
    const [
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalPatients,
      totalSpecializations,
      topRatedDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      DoctorProfileModel.countDocuments(),
      DoctorProfileModel.countDocuments({ isVerified: true }),
      DoctorProfileModel.countDocuments({
        isVerified: false,
        documents: { $exists: true, $not: { $size: 0 } },
      }),
      PatientProfileModel.countDocuments(),
      SpecializationModel.countDocuments(),
      DoctorProfileModel.find({ isVerified: true })
        .sort({ averageRating: -1 })
        .limit(5)
        .select("userId averageRating specialization")
        .populate("userId", "firstName lastName photo"),
      AppointmentModel.countDocuments(),
      AppointmentModel.countDocuments({ status: "completed" }),
      AppointmentModel.countDocuments({ status: "pending" }),
      AppointmentModel.countDocuments({ status: "cancelled" }),
    ]);

    return {
      doctors: {
        total: totalDoctors,
        verified: verifiedDoctors,
        pending: pendingDoctors,
        topRated: topRatedDoctors,
      },
      patients: {
        total: totalPatients,
      },
      specializations: {
        total: totalSpecializations,
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments,
      },
    };
  }
}

export const adminService = new AdminService();
