import express from "express";
import { doctorController } from "./../controllers/DoctorController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";
protect;

const router = express.Router();

// AUTHENTICATED ROUTES
router.use(protect);
router.get("/me", restrictTo("doctor"), doctorController.getMe);

export { router as doctorRoutes };
