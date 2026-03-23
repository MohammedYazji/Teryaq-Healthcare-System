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

router.get("/:id", AppointmentController.getAppointment);

router.patch(
  "/:id/status",
  restrictTo("doctor"),
  AppointmentController.updateStatus,
);

router.patch("/:id/reschedule", AppointmentController.reschedule);

export { router as appointmentRoutes };
