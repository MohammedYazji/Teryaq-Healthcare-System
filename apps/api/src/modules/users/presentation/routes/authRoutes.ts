import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { protect } from "../../../../core/middlewares/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.patch("/updateMyPassword", protect, authController.updatePassword);

export {router as authRoutes};