import { Router } from "express";
import { MedicalRecordController } from "../controllers/MedicalRecordController";
import {
  isActive,
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// AUTHENTICATED ROUTES
router.use(protect);

router.post(
  "/",
  restrictTo("doctor"),
  isActive,
  MedicalRecordController.createRecord,
);

router.get(
  "/appointments/:appointmentId",
  MedicalRecordController.getRecordByAppointment,
);

router
  .route("/:id")
  .patch(restrictTo("doctor"), isActive, MedicalRecordController.updateRecord)
  .delete(restrictTo("doctor"), isActive, MedicalRecordController.deleteRecord);

export { router as medicalRecordRouter };
