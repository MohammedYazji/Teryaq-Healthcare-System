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

// STATISTICS
router.get("/stats", adminController.getStats);

// DOCTOR_MANAGEMENT
router.get("/pending-doctors", adminController.getPendingDoctors);
router.patch("/verify-doctor/:doctorId", adminController.verifyDoctor);

// USER_MANAGEMENT
router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/status", adminController.updateUserStatus);
router.patch("/users/:userId/role", adminController.updateUserRole);

export { router as adminRoutes };
