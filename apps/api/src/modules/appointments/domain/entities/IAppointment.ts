export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface IAppointment {
    id?: string;
    patientId?: string;
    doctorId?: string;
    slotId?: string;
    appointmentDate: Date;
    appointmentTime: string;
    status: AppointmentStatus;
    reason: string;
    notes?: string;
    fee: number;
}