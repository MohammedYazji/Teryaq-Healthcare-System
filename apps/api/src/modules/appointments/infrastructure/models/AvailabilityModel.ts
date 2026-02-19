import mongoose, {Schema, Document, Model} from "mongoose";
import { IAvailabilitySlot } from "../../domain/entities/IAvailabilitySlot";

export interface IAvailabilityDocument extends IAvailabilitySlot, Document {}

const AvailabilitySchema = new Schema<IAvailabilityDocument>({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'DoctorProfile',
        required: true
    },
    dayOfWeek: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });

export const AvailabilityModel: Model<IAvailabilityDocument> = mongoose.model<IAvailabilityDocument>('Availability', AvailabilitySchema);