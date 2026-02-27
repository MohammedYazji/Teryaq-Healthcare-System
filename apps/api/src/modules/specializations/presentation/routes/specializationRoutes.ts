import { Router } from "express";
import { specializationController } from "../controllers/SpecializationController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  specializationController.createSpecialization,
);

export { router as specializationRoutes };
