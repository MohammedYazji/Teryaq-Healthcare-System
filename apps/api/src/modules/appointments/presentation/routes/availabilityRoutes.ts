import { Router } from "express";
import { AvailabilityController } from "../controllers/AvailabilityControl";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// ALL ROUTS MUST BE AUTHENTICATED
router.use(protect);

router.patch(
  "/setBulk",
  restrictTo("doctor"),
  AvailabilityController.createBulkSlots
);

export { router as availabilityRoutes };
