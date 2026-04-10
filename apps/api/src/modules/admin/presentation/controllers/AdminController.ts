import { Request, Response, NextFunction } from "express";
import { adminService } from "../../application/services/AdminService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class AdminController {
  // Fetch ALL DOCTORS WAITING VERIFICATION
  getPendingDoctors = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const doctors = await adminService.getPendingDoctors();

      res.status(200).json({
        status: "success",
        results: doctors.length,
        data: { doctors },
      });
    },
  );

  // VERIFY DOCTOR PROFILE
  verifyDoctor = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doctorId = req.params.doctorId as string;
      const { isVerified } = req.body;

      if (typeof isVerified !== "boolean") {
        return next(
          new AppError("isVerified must be a boolean value (true/false)", 400),
        );
      }

      const updatedDoctor = await adminService.verifyDoctor(
        doctorId,
        isVerified,
      );

      res.status(200).json({
        status: "success",
        message: isVerified
          ? "Doctor verified successfully"
          : "Doctor verification failed",
        data: { doctor: updatedDoctor },
      });
    },
  );

  // FETCH ALL USERS (ALLOW SEARCHING ON SPECIFIC USER)
  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query;
    const users = await adminService.getAllUsers(search as string);

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  });

  // UPDATE THE USER STATUS VIA ADMIN
  updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await adminService.updateUserStatus(userId as string, status);

    res.status(200).json({
      status: "success",
      message: `User status updated to ${status}`,
      data: { user },
    });
  });

  // UPDATE THE USER ROLE (ADMIN, PATIENT, DOCTOR)
  updateUserRole = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { role } = req.body;

      // Check the role if is it valid one
      const validRoles = ["admin", "doctor", "patient"];
      if (!role || !validRoles.includes(role)) {
        throw new AppError(
          `Please provide a valid role: ${validRoles.join(", ")}`,
          400,
        );
      }

      const user = await adminService.updateUserRole(userId as string, role);

      res.status(200).json({
        status: "success",
        message: `User role updated successfully to ${role}`,
        data: { user },
      });
    },
  );

  // GET THE ADMIN STATS FOR DASHBOARD
  getStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  });
}

export const adminController = new AdminController();
