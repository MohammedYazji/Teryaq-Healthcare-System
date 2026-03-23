import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppointmentService } from "../../application/services/AppointmentService";
import { AppError } from "../../../../core/errors/AppError";

export class AppointmentController {
  // ALLOW PATIENT TO BOOK A NEW APPOINTMENT
  static bookAppointment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const patientId = req.user?.patientProfileId as string;
      const { slotId, reason } = req.body;
      if (!slotId) {
        return next(new AppError("Please provide a slot ID", 400));
      }

      const appointment = await AppointmentService.createAppointment(
        patientId,
        slotId,
        reason,
      );

      res.status(201).json({
        status: "success",
        data: { appointment },
      });
    },
  );

  // GET THE CURRENT USER APPOINTMENTS
  // EITHER PATIENT OR DOCTOR
  static getMyAppointments = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // BASED THE USER ROLE
      const profileId =
        req.user?.role === "doctor"
          ? req.user.doctorProfileId
          : req.user.patientProfileId;

      if (!profileId) {
        return next(new AppError("Profile not found", 404));
      }

      const appointments = await AppointmentService.getUserAppointments(
        req.user?.role as "doctor" | "patient",
        profileId as string,
      );

      res.status(200).json({
        status: "success",
        results: appointments.length,
        data: { appointments },
      });
    },
  );

  // UPDATE THE APPOINTMENT STATUS VIA DOCTOR
  // ACCEPT/REJECT APPOINTMENT
  static updateStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { status, cancellationReason } = req.body;
      const doctorId = req.user?.doctorProfileId;

      if (!["scheduled", "cancelled"].includes(status)) {
        return next(
          new AppError(
            "Invalid status. Please use scheduled or cancelled",
            400,
          ),
        );
      }

      const appointment = await AppointmentService.updateStatus(
        id as string,
        doctorId as string,
        status,
        cancellationReason,
      );

      res.status(200).json({
        status: "success",
        data: { appointment },
      });
    },
  );

  // GET APPOINTMENT BY ID
  static getAppointment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const profileId =
        req.user?.role === "doctor"
          ? req.user.doctorProfileId
          : req.user.patientProfileId;

      const appointment = await AppointmentService.getAppointmentById(
        id as string,
        profileId as string,
        req.user?.role as string,
      );

      res.status(200).json({
        status: "success",
        data: { appointment },
      });
    },
  );

  // RESCHEDULED AN APPOINTMENT
  static reschedule = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params; // Appointment ID
      const { newSlotId } = req.body; // New Slot ID from Body

      // Check the role of the subject
      const role = req.user?.role as "doctor" | "patient";
      const profileId =
        role === "doctor"
          ? req.user?.doctorProfileId
          : req.user?.patientProfileId;

      if (!profileId) {
        return next(new AppError("Profile not found for this user", 400));
      }

      const appointment = await AppointmentService.reschedule(
        id as string,
        profileId,
        role,
        newSlotId,
      );

      res.status(200).json({
        status: "success",
        message: "Appointment rescheduled successfully",
        data: { appointment },
      });
    },
  );
}
