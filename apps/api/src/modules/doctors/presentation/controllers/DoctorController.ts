import { Request, Response, NextFunction } from "express";
import { doctorService } from "../../application/services/DoctorService";
import { catchAsync } from "../../../../core/utils/catchAsync";

export class DoctorController {
  // GET THE CURRENT AUTHENTICATED USER
  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const profile = await doctorService.getProfileByUserId(req.user.id);

      res.status(200).json({
        status: "success",
        data: { profile },
      });
    },
  );
}

export const doctorController = new DoctorController();
