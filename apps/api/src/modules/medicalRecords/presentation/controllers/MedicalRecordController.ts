import { Request, Response, NextFunction } from "express";
import { MedicalRecordService } from "../../application/services/MedicalRecordService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class MedicalRecordController {
  //   CREATE MEDICAL RECORD FOR THE APPOINTMENT VIA THE DOCTOR
  static createRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Ensure the user is a doctor
      const doctorId = req.user?.doctorProfileId;
      if (!doctorId) {
        return next(
          new AppError("Only doctors can create medical records", 403),
        );
      }

      const record = await MedicalRecordService.createRecord(
        doctorId.toString(),
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: { record },
      });
    },
  );

  // GET THE RECORD OF THE APPOINTMENT FOR (PATIENT, OR DOCTOR)
  static getRecordByAppointment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { appointmentId } = req.params;

      if (typeof appointmentId !== "string") {
        return next(new AppError("Invalid Appointment ID format", 400));
      }

      const record =
        await MedicalRecordService.getRecordByAppointment(appointmentId);

      res.status(200).json({
        status: "success",
        data: { record },
      });
    },
  );

  // UPDATE THE RECORD INFORMATION
  static updateRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;
      const { id } = req.params;

      if (!doctorId)
        return next(
          new AppError("Only doctors can update medical records", 403),
        );

      const record = await MedicalRecordService.updateMedicalRecord(
        id as string,
        doctorId.toString(),
        req.body,
      );

      res.status(200).json({
        status: "success",
        data: { record },
      });
    },
  );
}
