import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { patientService } from "../../application/services/PatientService";

export class PatientController {
  // GET THE CURRENT AUTHENTICATED DOCTOR
  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const profile = await patientService.getProfileByUserId(req.user.id);

      res.status(200).json({
        status: "success",
        data: { profile },
      });
    },
  );
}

export const patientController = new PatientController();
