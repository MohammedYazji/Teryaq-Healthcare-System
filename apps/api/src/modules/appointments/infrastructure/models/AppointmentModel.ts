import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAppointment } from '../../../appointments/domain/entities/IAppointment';

export interface IAppointmentDocument extends IAppointment, Document { }

const AppointmentSchema = new Schema<IAppointmentDocument>(
    {
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: 'DoctorProfile',
            required: [true, 'Appointment must belong to a doctor'],
        },
        patientId: {
            type: Schema.Types.ObjectId,
            ref: 'PatientProfile',
            required: [true, 'Appointment must belong to a patient'],
        },
        slotId: {
            type: Schema.Types.ObjectId,
            ref: 'Availability',
            required: [true, 'Appointment must be linked to a specific slot'],
        },
        appointmentDate: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
            default: 'pending',
        },
        reason: {
            type: String,
            required: [true, 'Please provide a reason for the appointment'],
        },
        notes: String,
        fee: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// MAKE INDEX WITH DCOTOR ID AND APPOINTMENT DATE
// FOR QUICK SEARCH ABOUT DOCTOR AVAILABLE TIMES IN SPECIFIC DAY
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

// PREVENT TO MAKE ANOTHER APPOINTMENT FOR THE SAME SLOT AT THE SAME DATE
AppointmentSchema.index({ slotId: 1, appointmentDate: 1 }, { unique: true });

export const AppointmentModel: Model<IAppointmentDocument> = mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
