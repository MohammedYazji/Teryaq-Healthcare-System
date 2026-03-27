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
}

export const adminController = new AdminController();
