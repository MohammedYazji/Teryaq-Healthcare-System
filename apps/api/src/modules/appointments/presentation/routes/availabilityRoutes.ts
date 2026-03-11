import { Router } from "express";
import { AvailabilityController } from "../controllers/AvailabilityControl";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// UNAUTHENTICATED ROUTES
router.get("/doctor/:doctorId", AvailabilityController.getDoctorSlots);

// AUTHENTICATED ROUTES
router.use(protect);

router.patch(
  "/setBulk",
  restrictTo("doctor"),
  AvailabilityController.createBulkSlots
);
router.get(
  "/mySlots",
  restrictTo("doctor"),
  AvailabilityController.getMyAvailability
);

export { router as availabilityRoutes };
