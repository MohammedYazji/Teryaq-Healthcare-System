import { Router } from "express";
import { specializationController } from "../controllers/SpecializationController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// UNAUTHENTICATED ROUTES
router.get("/", specializationController.getAllSpecializations);

// AUTHENTICATED ROUTES
router.use(protect);
router.post(
  "/",
  restrictTo("admin"),
  specializationController.createSpecialization,
);

export { router as specializationRoutes };
