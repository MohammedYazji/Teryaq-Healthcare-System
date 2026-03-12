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
}
