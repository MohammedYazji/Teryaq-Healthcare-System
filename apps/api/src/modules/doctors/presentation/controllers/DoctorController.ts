import { Request, Response, NextFunction } from "express";
import { doctorService } from "../../application/services/DoctorService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { filterObj } from "../../../../core/utils/filterObject";
import { AppError } from "../../../../core/errors/AppError";

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

  // FETCH THE LIST OF DOCTORS
  getAllDoctors = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctors = await doctorService.getAllDoctors(req.query);

      res.status(200).json({
        status: "success",
        results: doctors.length,
        data: { doctors },
      });
    },
  );

  // FETCH A DOCTOR USING DOCTOR ID
  getDoctorById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctor = await doctorService.getDoctorById(req.params.id as string);

      res.status(200).json({
        status: "success",
        data: { doctor },
      });
    },
  );

  // UPLOAD DOCTOR CERTIFICATES
  uploadDocs = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.body.processedImages || req.body.processedImages.length === 0) {
        return next(new AppError("Please upload at least one document", 400));
      }

      const updatedProfile = await doctorService.uploadCertificates(
        req.user.id,
        req.body.processedImages,
      );

      res.status(200).json({
        status: "success",
        message: "Documents uploaded successfully. Waiting for admin review.",
        data: { profile: updatedProfile },
      });
    },
  );
}

export const doctorController = new DoctorController();
