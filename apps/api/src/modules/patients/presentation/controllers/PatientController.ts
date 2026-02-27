import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { patientService } from "../../application/services/PatientService";
import { filterObj } from "../../../../core/utils/filterObject";

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

  // UPDATE THE CURRENT AUTHENTICATED PATIENT
  updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Filter just the allowed fields to update
      const filteredBody = filterObj(
        req.body,
        "bloodType",
        "gender",
        "birthDate",
        "allergies",
        "chronicConditions",
        "emergencyContact",
        "emergencyContactPhone",
      );

      // update the doctor profile
      const updatedProfile = await patientService.updateProfile(
        req.user.id,
        filteredBody,
      );

      res.status(200).json({
        status: "success",
        data: { profile: updatedProfile },
      });
    },
  );
}

export const patientController = new PatientController();
