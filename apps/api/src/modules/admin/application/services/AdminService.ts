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

  /// FINANCIAL STATISTICS ///
  // Fetch financial data for the reports dashboard
  async getFinancialStats() {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Total revenue from paid appointments
    const revenueAgg = await AppointmentModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$fee" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Total paid consultations and average per session
    const totalConsultations = await AppointmentModel.countDocuments({
      paymentStatus: "paid",
    });
    const avgPerSession =
      totalConsultations > 0
        ? Math.round((totalRevenue / totalConsultations) * 10) / 10
        : 0;

    // Refunds
    const refundAgg = await AppointmentModel.aggregate([
      { $match: { paymentStatus: "refunded" } },
      { $group: { _id: null, total: { $sum: "$fee" }, count: { $sum: 1 } } },
    ]);
    const totalRefunds = refundAgg[0]?.total || 0;
    const refundCount = refundAgg[0]?.count || 0;

    // Monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await AppointmentModel.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$fee" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyRevenue = monthlyAgg.map((m) => ({
      month: monthNames[m._id.month - 1] || "Unknown",
      revenue: m.revenue,
    }));

    // recent transactions
    const recentAppointments = await AppointmentModel.find({
      paymentStatus: { $in: ["paid", "refunded", "unpaid", "failed"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "firstName lastName" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "firstName lastName" },
      });

    const transactions = recentAppointments.map((a, i) => {
      const appt = a as any;
      return {
        id: `TXN-${String(i + 1).padStart(3, "0")}`,
        patient: `${appt.patientId?.userId?.firstName || "Unknown"} ${appt.patientId?.userId?.lastName || ""}`,
        doctor: `Dr. ${appt.doctorId?.userId?.firstName || "Unknown"} ${appt.doctorId?.userId?.lastName || ""}`,
        amount: appt.fee,
        date: new Date(appt.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        status:
          appt.paymentStatus === "paid"
            ? "completed"
            : appt.paymentStatus || "unknown",
        type: "Consultation",
      };
    });

    return {
      summary: {
        totalRevenue,
        totalConsultations,
        avgPerSession,
        refundsIssued: totalRefunds,
        refundCount,
      },
      monthlyRevenue,
      transactions,
    };
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
      DoctorProfileModel.countDocuments({ isVerified: true }).setOptions({
        unverified: true,
      }),
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
