import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppointmentService } from "../../application/services/AppointmentService";
import { AppError } from "../../../../core/errors/AppError";

export class AppointmentController {
  // ALLOW PATIENT TO BOOK A NEW APPOINTMENT
  static bookAppointment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const patientId = req.user?.patientProfileId as string;
      const { slotId, reason } = req.body;
      if (!slotId) {
        return next(new AppError("Please provide a slot ID", 400));
      }

      const appointment = await AppointmentService.createAppointment(
        patientId,
        slotId,
        reason,
      );

      res.status(201).json({
        status: "success",
        data: { appointment },
      });
    },
  );

  // GET THE CURRENT USER APPOINTMENTS
  // EITHER PATIENT OR DOCTOR
  static getMyAppointments = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // BASED THE USER ROLE
      const profileId =
        req.user?.role === "doctor"
          ? req.user.doctorProfileId
          : req.user.patientProfileId;

      if (!profileId) {
        return next(new AppError("Profile not found", 404));
      }

      const appointments = await AppointmentService.getUserAppointments(
        req.user?.role as "doctor" | "patient",
        profileId as string,
      );

      res.status(200).json({
        status: "success",
        results: appointments.length,
        data: { appointments },
      });
    },
  );
}
