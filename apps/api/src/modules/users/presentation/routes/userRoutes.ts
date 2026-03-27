import { Router } from "express";
import { userController } from "../controllers/UserController";
import { protect } from "../../../../core/middlewares/authMiddleware";
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
  uploadSingleImage("photo"),
  resizeImage(500, 500),
  userController.updateMe,
);
router.delete("/deleteMe", userController.deleteMe);

export { router as userRoutes };
