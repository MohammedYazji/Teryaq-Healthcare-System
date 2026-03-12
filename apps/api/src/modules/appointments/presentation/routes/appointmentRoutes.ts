import { Router } from "express";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";
import { AppointmentController } from "../controllers/AppointmentController";

const router = Router();

// AUTHENTICATED ROUTES
router.use(protect);

router.post(
  "/book",
  restrictTo("patient"),
  AppointmentController.bookAppointment,
);
router.get("/myAppointments", AppointmentController.getMyAppointments);

export { router as appointmentRoutes };
