import mongoose from "mongoose";

export interface IPrescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IMedicalRecord {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnosis: string;
  symptoms?: string;
  prescriptions: IPrescription[];
  notes?: string;
  attachments?: string[];
}
