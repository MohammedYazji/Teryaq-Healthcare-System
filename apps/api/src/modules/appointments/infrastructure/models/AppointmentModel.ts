import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAppointment } from '../../../appointments/domain/entities/IAppointment';

export interface IAppointmentDocument extends IAppointment, Document {}

const AppointmentSchema = new Schema<IAppointmentDocument>({ 
    doctorId: {
         type: Schema.Types.ObjectId, 
         ref: 'DoctorProfile', 
         required: true 
        },
    patientId: {
         type: Schema.Types.ObjectId, 
         ref: 'PatientProfile', 
         required: true 
        },
    slotId: {
         type: Schema.Types.ObjectId, 
         ref: 'AvailabilitySlot', 
         required: true 
        },
    appointmentDate: {
         type: Date, 
         required: true 
        },
    status: {
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled', 'no-show'], 
        default: 'scheduled' 
    },
    reason: {
         type: String 
        },
    notes: {
         type: String 
        },
    fee: {
         type: Number, 
         required: true 
        }
}, { timestamps: true });

export const AppointmentModel: Model<IAppointmentDocument> = mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);


