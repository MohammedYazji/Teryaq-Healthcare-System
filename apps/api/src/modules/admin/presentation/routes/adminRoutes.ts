import { Router } from "express";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";
import { adminController } from "../controllers/AdminController";

const router = Router();

// AUTHENTICATED ROUTES
router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", adminController.getStats);

router.get("/pending-doctors", adminController.getPendingDoctors);
router.patch("/verify-doctor/:doctorId", adminController.verifyDoctor);

export { router as adminRoutes };
