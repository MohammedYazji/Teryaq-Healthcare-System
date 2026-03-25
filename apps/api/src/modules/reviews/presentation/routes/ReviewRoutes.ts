import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// UNAUTHENTICATED ROUTES
router.get("/doctor/:doctorId", ReviewController.getDoctorReviews);

// AUTHENTICATED ROUTES
router.use(protect);

router.post("/", restrictTo("patient"), ReviewController.createReview);

export { router as reviewRouter };
