import { Router } from "express";
import { MedicalRecordController } from "../controllers/MedicalRecordController";
import {
  protect,
  restrictTo,
} from "../../../../core/middlewares/authMiddleware";

const router = Router();

// AUTHENTICATED ROUTES
router.use(protect);

router.post("/", restrictTo("doctor"), MedicalRecordController.createRecord);

router.get(
  "/appointments/:appointmentId",
  MedicalRecordController.getRecordByAppointment,
);

router
  .route("/:id")
  .patch(restrictTo("doctor"), MedicalRecordController.updateRecord)
  .delete(restrictTo("doctor"), MedicalRecordController.deleteRecord);

export { router as medicalRecordRouter };
