import { Request, Response, NextFunction } from "express";
import { AvailabilityService } from "../../application/services/AvailabilityService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class AvailabilityController {
  // CONTROLLER TO HANDLE BULK CREATION OF DOCTOR AVAILABILITY SLOTS
  static createBulkSlots = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // GET THE DOCTOR ID FROM THE AUTHENTICATED USER (USING THE AUTH MIDDLEWARE)
      const doctorId = req.user?.doctorProfileId;

      if (!doctorId) {
        return next(
          new AppError(
            "You must be logged in as a doctor to perform this action",
            401,
          ),
        );
      }

      // CALL THE SERVICE TO GENERATE SLOTS
      const slots = await AvailabilityService.createBulkSlots(
        doctorId,
        req.body,
      );

      // SEND THE RESPONSE
      res.status(201).json({
        status: "success",
        results: slots.length,
        data: { slots },
      });
    },
  );

  // PUBLIC CONTROLLER TO GET AVAILABILITY FOR ANY DOCTOR (USED BY PATIENTS)
  static getDoctorSlots = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.params.doctorId as string;
      const { day } = req.query; // EXTRACT THE DAY FROM THE QUERY STRING

      if (!doctorId) {
        return next(new AppError("Doctor ID is required", 400));
      }

      // JUST GET THE AVAILABLE SLOTS TO THE PUBLIC/PATIENTS
      // PASS DAY FOR SPECIFIC DAY, OR GET AVAILABLE SLOTS FOR ALL DAYS
      const slots = await AvailabilityService.getDoctorAvailability(
        doctorId,
        true,
        day as string,
      );

      res.status(200).json({
        status: "success",
        results: slots.length,
        data: { slots },
      });
    },
  );

  // CONTROLLER FOR THE LOGGED-IN DOCTOR TO SEE ALL THEIR SLOTS
  static getMyAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;

      if (!doctorId) {
        return next(new AppError("Doctor profile not found", 404));
      }

      // GET ALL SLOTS (BOTH AVAILABLE AND BOOKED FOR THE DOCTOR)
      const slots = await AvailabilityService.getDoctorAvailability(
        doctorId,
        false,
      );

      res.status(200).json({
        status: "success",
        results: slots.length,
        data: { slots },
      });
    },
  );

  // CONTROLLER FOR DOCTOR TO UPDATE THEIR SLOTS
  static updateMySlot = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;
      const slotId = req.params.id;

      if (!doctorId) {
        return next(new AppError("Doctor profile not found", 404));
      }

      // CALL THE SERVICE TO UPDATE THE SLOT
      const slot = await AvailabilityService.updateSlot(slotId as string, doctorId as string, req.body);

      res.status(200).json({
        status: "success",
        data: { slot },
      });
    },
  );

  // CONTROLLER FOR THE LOGGED-IN DOCTOR TO DELETE THEIR SLOTS
  static deleteMySlot = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;
      const slotId = req.params.id;

      if (!doctorId) {
        return next(new AppError("Doctor profile not found", 404));
      }

      // CALL THE SERVICE TO DELETE THE SLOT
      await AvailabilityService.deleteSlot(slotId as string, doctorId as string);

      res.status(204).json({
        status: "success",
        data: null,
      });
    },
  );
}
