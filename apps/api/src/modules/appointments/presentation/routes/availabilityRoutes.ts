import { Router } from "express";
import { AvailabilityController } from "../controllers/AvailabilityController";
import {
  isActive,
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
  isActive,
  AvailabilityController.createBulkSlots,
);
router.get(
  "/mySlots",
  restrictTo("doctor"),
  AvailabilityController.getMyAvailability,
);

router.route("/slots/:id")
.patch(restrictTo("doctor"), isActive, AvailabilityController.updateMySlot)
.delete(restrictTo("doctor"), isActive, AvailabilityController.deleteMySlot)

export { router as availabilityRoutes };
