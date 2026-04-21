import mongoose, { Schema, Document, Model } from "mongoose";
import { IAvailabilitySlot } from "../../domain/entities/IAvailabilitySlot";

export interface IAvailabilityDocument extends IAvailabilitySlot, Document { }

const AvailabilitySchema = new Schema<IAvailabilityDocument>(
    {
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: 'DoctorProfile',
            required: [true, 'Availability slot must belong to a doctor'],
        },
        dayOfWeek: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true,
            lowercase: true,
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['available', 'reserved', 'booked'],
            default: 'available',
        },
        reservedUntil: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// MAKE THE FETCH OF THE AVAILABILITY SLOT FASTER WITH INDEXING
AvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 });

export const AvailabilityModel: Model<IAvailabilityDocument> = mongoose.model<IAvailabilityDocument>('Availability', AvailabilitySchema);