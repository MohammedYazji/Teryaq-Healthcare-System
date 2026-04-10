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

// UNAUTHENTICATED ROUTES
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);

// AUTHENTICATED ROUTES
router.use(protect);
router.use(restrictTo("doctor"));

router.get("/me", doctorController.getMe);

router.patch("/updateMe", isActive, doctorController.updateMe);

router.patch(
  "/upload-documents",
  isActive,
  uploadMultipleImages("documents"),
  resizeMultipleImages,
  doctorController.uploadDocs,
);

export { router as doctorRoutes };
