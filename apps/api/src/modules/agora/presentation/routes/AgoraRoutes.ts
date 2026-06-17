import { Router } from "express";
import { AgoraController } from "../controllers/AgoraController";
import { protect } from "../../../../core/middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.post("/token", AgoraController.getToken);

export { router as agoraRoutes };
