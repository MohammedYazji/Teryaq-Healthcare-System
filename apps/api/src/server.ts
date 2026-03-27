import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import { globalErrorHandler } from "./core/middlewares/errorMiddleware";
import { AppError } from "./core/errors/AppError";
import { authRoutes } from "./modules/users/presentation/routes/authRoutes";
import { userRoutes } from "./modules/users/presentation/routes/userRoutes";
import { specializationRoutes } from "./modules/specializations/presentation/routes/specializationRoutes";
import { doctorRoutes } from "./modules/doctors/presentation/routes/DoctorRoutes";
import { patientRoutes } from "./modules/patients/presentation/routes/patientRoutes";
import { availabilityRoutes } from "./modules/appointments/presentation/routes/availabilityRoutes";
import { appointmentRoutes } from "./modules/appointments/presentation/routes/appointmentRoutes";
import { medicalRecordRouter } from "./modules/medicalRecords/presentation/routes/MedicalRecordRoutes";
import { reviewRouter } from "./modules/reviews/presentation/routes/ReviewRoutes";
import { adminRoutes } from "./modules/admin/presentation/routes/adminRoutes";

const bootstrap = async () => {
  // SETUP EXPRESS
  const app = express();

  // CONNECT TO MONGODB
  await connectDB();

  // USE MIDDLEWARES
  app.use(express.json());
  app.use(cors());

  // ROUTES
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/specializations", specializationRoutes);
  app.use("/api/v1/doctors", doctorRoutes);
  app.use("/api/v1/patients", patientRoutes);
  app.use("/api/v1/availability", availabilityRoutes);
  app.use("/api/v1/appointments", appointmentRoutes);
  app.use("/api/v1/medical-record", medicalRecordRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/admin", adminRoutes);

  // HANDLE UNHANDLED ROUTES
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  // GLOBAL ERROR HANDLER
  app.use(globalErrorHandler);

  // START SERVER
  app.listen(config.PORT, () => {
    console.log(`Server listening on port: ${config.PORT}`);
  });
};
bootstrap();
