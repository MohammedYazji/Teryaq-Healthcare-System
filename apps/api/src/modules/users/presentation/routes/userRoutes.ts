import { Router } from "express";
import { userController } from "../controllers/UserController";
import { protect } from "../../../../core/middlewares/authMiddleware";

const router = Router();

// MUST BE AUTHENTICATED TO ACCESS ALL THOSE FOLLOWING ROUTES
router.use(protect);

router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

export { router as userRoutes };
