import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPatientProfile } from '../../domain/entities/IPatientProfile';

export interface IPatientDocument extends IPatientProfile, Document {}

const PatientSchema: Schema<IPatientDocument> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bloodType: {
        type: String,
    },
    allergies: {
        type: [String],
        default: []
    },
    emergencyContact: {
        type: String,
        required: [true, "Emergency contact is required"]
    },
    emergencyContactPhone: {
        type: String,
        required: [true, "Emergency contact phone is required"]
    }
}, { timestamps: true });

export const PatientProfileModel: Model<IPatientDocument> = mongoose.model<IPatientDocument>('PatientProfile', PatientSchema);