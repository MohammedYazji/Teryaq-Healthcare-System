import { AppError } from "../../../../core/errors/AppError";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";
import { PatientProfileModel } from "../../../patients/infrastructure/models/PatientModel";
import { SpecializationModel } from "../../../specializations/infrastructure/models/SpecializationModel";
import { UserModel } from "../../../users/infrastructure/models/UserModel ";

export class AdminService {
  /// DOCTOR_MANAGEMENT ///
  // Fetch all doctors wait verification their accounts & Have documents to review
  async getPendingDoctors() {
    return await DoctorProfileModel.find({
      isVerified: false,
      documents: { $exists: true, $not: { $size: 0 } },
    })
      .setOptions({ unverified: true })
      .populate("userId", "firstName lastName email photo")
      .populate("specialization", "name");
  }

  // Verify the doctor account
  async verifyDoctor(doctorId: string, isVerified: boolean) {
    const doctor = await DoctorProfileModel.findByIdAndUpdate(
      doctorId,
      { isVerified },
      { returnDocument: "after", runValidators: true },
    )
      .setOptions({ unverified: true })
      .populate("userId", "firstName lastName email");

    if (!doctor) {
      throw new AppError("Doctor profile not found", 404);
    }

    return doctor;
  }

  /// USER_MANAGEMENT ///
  // FETCH ALL USERS (PATIENTS & DOCTORS) CAN ALSO FETCH BASED ON SEARCH (FIRSTNAME, LASTNAME, EMAIL)
  async getAllUsers(searchTerm?: string) {
    let query: any = {};

    if (searchTerm) {
      query.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }

    return await UserModel.find(query)
      .setOptions({ unfiltered: true }) // Pass the middleware (in the user model) and get the suspended users too
      .select("-password");
  }

  // UPDATE USER STATUS
  async updateUserStatus(
    userId: string,
    status: "active" | "suspended" | "pending",
  ) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { status },
      { returnDocument: "after", runValidators: true },
    ).setOptions({ unfiltered: true });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  // UPDATE USER ROLE
  async updateUserRole(userId: string, role: "admin" | "doctor" | "patient") {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: "after", runValidators: true },
    ).setOptions({ unfiltered: true });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  /// STATISTICS ///
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
      DoctorProfileModel.countDocuments().setOptions({ unverified: true }),
      DoctorProfileModel.countDocuments({ isVerified: true }).setOptions({ unverified: true }),
      DoctorProfileModel.countDocuments({
        isVerified: false,
        documents: { $exists: true, $not: { $size: 0 } },
      }).setOptions({ unverified: true }),
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
