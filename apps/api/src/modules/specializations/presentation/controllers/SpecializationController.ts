import { Request, Response, NextFunction } from "express";
import { specializationService } from "../../application/services/SpecializationService";
import { catchAsync } from "../../../../core/utils/catchAsync";

class SpecializationController {
  // CREATE A NEW SPECIALIZATION
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

  // FETCH ALL SPECIALIZATIONS
  getAllSpecializations = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const specs = await specializationService.findAll();

      res.status(200).json({
        status: "success",
        results: specs.length,
        data: {
          specializations: specs,
        },
      });
    },
  );

  // FETCH A SPECIALIZATION
  getSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const specialization = await specializationService.findById(
        req.params.id as string,
      );

      res.status(200).json({
        status: "success",
        data: {
          specialization,
        },
      });
    },
  );

  // UPDATE A SPECIALIZATION
  updateSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const updatedSpec = await specializationService.update(
        req.params.id as string,
        req.body,
      );

      res.status(200).json({
        status: "success",
        data: { specialization: updatedSpec },
      });
    },
  );

  // DELETE A SPECIALIZATION
  deleteSpecialization = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      await specializationService.delete(req.params.id as string);

      res.status(204).json({
        status: "success",
        data: null,
      });
    },
  );
}

export const specializationController = new SpecializationController();
