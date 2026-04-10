import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { protect } from "../../../../core/middlewares/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/activate/:token", authController.activateAccount);
router.patch("/updateMyPassword", protect, authController.updatePassword);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

export { router as authRoutes };
