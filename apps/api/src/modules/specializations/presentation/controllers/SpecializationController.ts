import { Request, Response, NextFunction } from "express";
import { specializationService } from "../../application/services/SpecializationService";
import { catchAsync } from "../../../../core/utils/catchAsync";

class SpecializationController {
  createSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const newSpec = await specializationService.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          specialization: newSpec,
        },
      });
    },
  );
}

export const specializationController = new SpecializationController();
