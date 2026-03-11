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
            401
          )
        );
      }

      // CALL THE SERVICE TO GENERATE SLOTS
      const slots = await AvailabilityService.createBulkSlots(
        doctorId,
        req.body
      );

      // SEND THE RESPONSE
      res.status(201).json({
        status: "success",
        results: slots.length,
        data: { slots },
      });
    }
  );
}
