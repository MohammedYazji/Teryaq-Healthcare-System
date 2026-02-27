import { Router } from "express";
import { specializationController } from "../controllers/SpecializationController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// UNAUTHENTICATED ROUTES
router.get("/", specializationController.getAllSpecializations);
router.get("/:id", specializationController.getSpecialization);

// AUTHENTICATED ROUTES
router.use(protect);
router.post(
  "/",
  restrictTo("admin"),
  specializationController.createSpecialization,
);
router.patch(
  "/:id",
  restrictTo("admin"),
  specializationController.updateSpecialization,
);
router.delete(
  "/:id",
  restrictTo("admin"),
  specializationController.deleteSpecialization,
);

export { router as specializationRoutes };
