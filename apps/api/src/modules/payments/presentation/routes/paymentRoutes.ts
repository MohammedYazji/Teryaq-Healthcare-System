import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { isActive, protect } from "../../../../core/middlewares/authMiddleware";

const router = Router();
const paymentController = new PaymentController();

// AUTHENTICATED ROUTES
router.post(
  "/checkout-session/:appointmentId",
  protect,
  isActive,
  paymentController.createCheckoutSession,
);

export { router as paymentRoutes };
