import express from "express";
import { patientController } from "../controllers/PatientController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = express.Router();

// AUTHENTICATED ROUTES
router.use(protect);

router.get("/me", restrictTo("patient"), patientController.getMe);
router.patch("/updateMe", restrictTo("patient"), patientController.updateMe);

export { router as patientRoutes };
