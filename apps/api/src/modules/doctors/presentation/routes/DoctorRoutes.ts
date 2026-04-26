import express from "express";
import { doctorController } from "./../controllers/DoctorController";
import {
  isActive,
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";
import {
  resizeMultipleImages,
  uploadMultipleImages,
} from "../../../../core/middlewares/uploadMiddleware";

const router = express.Router();

// AUTHENTICATED ROUTES (placed before dynamic /:id to avoid conflict)
router.get("/me", protect, restrictTo("doctor"), doctorController.getMe);

// UNAUTHENTICATED ROUTES
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);

// MIDDLEWARES FOR FOLLOWING ROUTES
router.use(protect);
router.use(restrictTo("doctor"));

router.patch("/updateMe", isActive, doctorController.updateMe);

router.patch(
  "/upload-documents",
  isActive,
  uploadMultipleImages("documents"),
  resizeMultipleImages,
  doctorController.uploadDocs,
);

export { router as doctorRoutes };
