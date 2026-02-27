import { Request, Response, NextFunction } from "express";
import { doctorService } from "../../application/services/DoctorService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { filterObj } from "../../../../core/utils/filterObject";

export class DoctorController {
  // GET THE CURRENT AUTHENTICATED DOCTOR
  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const profile = await doctorService.getProfileByUserId(req.user.id);

      res.status(200).json({
        status: "success",
        data: { profile },
      });
    },
  );

  // UPDATE THE CURRENT AUTHENTICATED DOCTOR
  updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Filter just the allowed fields to update
      const filteredBody = filterObj(
        req.body,
        "specialization",
        "degree",
        "experienceYears",
        "bio",
        "consultationFee",
        "qualifications",
      );

      // update the doctor profile
      const updatedProfile = await doctorService.updateProfile(
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

export const doctorController = new DoctorController();
