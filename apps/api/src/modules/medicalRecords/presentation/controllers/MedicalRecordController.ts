import { Request, Response, NextFunction } from "express";
import path from "path";
import { MedicalRecordService } from "../../application/services/MedicalRecordService";
import { PdfService } from "../../../../core/services/PdfService";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";

export class MedicalRecordController {
  //   CREATE MEDICAL RECORD FOR THE APPOINTMENT VIA THE DOCTOR
  static createRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Ensure the user is a doctor
      const doctorId = req.user?.doctorProfileId;
      if (!doctorId) {
        return next(
          new AppError("Only doctors can create medical records", 403),
        );
      }

      const record = await MedicalRecordService.createRecord(
        doctorId.toString(),
        req.body,
      );

      res.status(201).json({
        status: "success",
        data: { record },
      });
    },
  );

  // GET THE RECORD OF THE APPOINTMENT FOR (PATIENT, OR DOCTOR)
  static getRecordByAppointment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { appointmentId } = req.params;

      if (typeof appointmentId !== "string") {
        return next(new AppError("Invalid Appointment ID format", 400));
      }

      const record =
        await MedicalRecordService.getRecordByAppointment(appointmentId);

      res.status(200).json({
        status: "success",
        data: { record },
      });
    },
  );

  // UPDATE THE RECORD INFORMATION
  static updateRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;
      const { id } = req.params;

      if (!doctorId)
        return next(
          new AppError("Only doctors can update medical records", 403),
        );

      const record = await MedicalRecordService.updateMedicalRecord(
        id as string,
        doctorId.toString(),
        req.body,
      );

      res.status(200).json({
        status: "success",
        data: { record },
      });
    },
  );

  // DELETE A RECORD
  static deleteRecord = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const doctorId = req.user?.doctorProfileId;
      const { id } = req.params;

      if (!doctorId) {
        return next(
          new AppError("Only doctors can delete medical records", 403),
        );
      }

      await MedicalRecordService.deleteMedicalRecord(
        id as string,
        doctorId.toString(),
      );

      res.status(204).json({
        status: "success",
        data: null,
      });
    },
  );

  // GET PATIENT HISTORY
  static getPatientHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const patientId = req.user?.patientProfileId;

      if (!patientId) {
        return next(
          new AppError("Patient profile not found for this user", 404),
        );
      }

      const history = await MedicalRecordService.getPatientHistory(patientId);

      res.status(200).json({
        status: "success",
        results: history.length,
        data: { history },
      });
    },
  );

  // EXPORT MEDICAL RECORD AS PDF
  static exportPDF = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      // Fetch the record with all the needed info (populated)
      const record = (await MedicalRecordService.getPopulatedRecord(
        id as string,
      )) as any;

      // Define the path to our EJS template
      const templatePath = path.join(
        __dirname,
        "../../infrastructure/templates/medical-report.ejs",
      );

      // Generate the PDF buffer
      const pdfBuffer = await PdfService.generatePdf(templatePath, { record });

      // Set the headers to download the file
      const fileName = `Medical-Report-${record.patientId.userId.lastName}.pdf`;

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length,
      });

      // Send the PDF buffer as a response
      res.end(pdfBuffer);
    },
  );
}
