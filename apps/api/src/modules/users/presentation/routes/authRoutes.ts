import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { protect } from "../../../../core/middlewares/authMiddleware";
import rateLimit from "express-rate-limit";
import { validate } from "../../../../core/middlewares/validateMiddleware";
import { loginSchema, signupSchema } from "../../../../core/utils/validations";

// LIMIT LOGIN ATTEMPTS: 10 per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { status: "fail", message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// LIMIT FORGOT PASSWORD REQUESTS: 5 per hour
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { status: "fail", message: "Too many password reset requests. Please try again in 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
const authController = new AuthController();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), loginLimiter, authController.login);
router.get("/activate/:token", authController.activateAccount);
router.patch("/updateMyPassword", protect, authController.updatePassword);
router.post("/forgotPassword", forgotPasswordLimiter, authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

export { router as authRoutes };
