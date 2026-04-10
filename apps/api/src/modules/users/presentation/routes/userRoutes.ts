import { Router } from "express";
import { userController } from "../controllers/UserController";
import { isActive, protect } from "../../../../core/middlewares/authMiddleware";
import {
  resizeImage,
  uploadSingleImage,
} from "../../../../core/middlewares/uploadMiddleware";

const router = Router();

// MUST BE AUTHENTICATED TO ACCESS ALL THOSE FOLLOWING ROUTES
router.use(protect);

router.get("/me", userController.getMe);
router.patch(
  "/updateMe",
  isActive,
  uploadSingleImage("photo"),
  resizeImage(500, 500),
  userController.updateMe,
);
router.delete("/deleteMe", isActive, userController.deleteMe);

export { router as userRoutes };
