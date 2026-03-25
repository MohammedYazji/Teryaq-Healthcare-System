import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../../application/services/ReviewService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class ReviewController {
  // Create a new Review
  static createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const patientId = req.user?.patientProfileId;

      if (!patientId) {
        return next(new AppError("Only patients can write reviews", 403));
      }

      const review = await ReviewService.createReview(
        patientId.toString(),
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: { review },
      });
    },
  );

  static getDoctorReviews = catchAsync(async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId as string;
    const reviews = await ReviewService.getDoctorReviews(doctorId);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
  });
}
