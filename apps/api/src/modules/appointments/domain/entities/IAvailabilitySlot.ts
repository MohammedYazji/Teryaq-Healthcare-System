import mongoose from "mongoose";

export type DayOfWeek =
  | 'monday' | 'tuesday' | 'wednesday'
  | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface IAvailabilitySlot {
  id?: string;
  doctorId: mongoose.Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status: 'available' | 'reserved' | 'booked';
  reservedUntil: Date | null;
}