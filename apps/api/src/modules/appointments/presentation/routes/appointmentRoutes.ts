import { Router } from "express";
import {
  isActive,
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
  isActive,
  AppointmentController.bookAppointment,
);

router.get("/myAppointments", AppointmentController.getMyAppointments);

router.get("/:id", AppointmentController.getAppointment);

router.patch(
  "/:id/status",
  isActive,
  restrictTo("doctor"),
  AppointmentController.updateStatus,
);

router.patch("/:id/reschedule", isActive, AppointmentController.reschedule);

export { router as appointmentRoutes };
