import { Request, Response, NextFunction } from "express";
import { MedicalRecordService } from "../../application/services/MedicalRecordService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class MedicalRecordController {
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
}
