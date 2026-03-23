import { Router } from "express";
import { MedicalRecordController } from "../controllers/MedicalRecordController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", restrictTo("doctor"), MedicalRecordController.createRecord);

export { router as medicalRecordRouter };
