import mongoose from "mongoose";

export type AppointmentStatus =
  | "pending" // WAITING THE DOCTOR APPROVAL
  | "scheduled" // APPROVED & COMMING
  | "in-progress" // ACTIVE SESSION
  | "completed" // DONE
  | "cancelled" // CANCELLED SESSION
  | "no-show" // PATIENT DIDN'T ATTEND TO THE SESSION
  | "rescheduled"; // THE APPOINTMENT RESCHEDULED

export interface IAppointment {
  id?: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId | any;
  slotId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string; // SNAPSHOT (COPY FROM THE TIME)
  status: AppointmentStatus;
  reason: string; // Patient's complaint (Input)
  cancellationReason?: string; // Reason for cancellation (Logistics)
  notes?: string; // Doctor's medical notes (Clinical)
  fee: number;
  isPaid: boolean;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  stripeSessionId?: string;
}
