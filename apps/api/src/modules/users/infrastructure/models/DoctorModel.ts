import mongoose, {Schema, Document, Model} from "mongoose";
import { IDoctorProfile } from "../../domain/entities/IDoctorProfile";

export interface IDoctorDocument extends IDoctorProfile, Document {}

const DoctorSchema = new Schema<IDoctorDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: [true, "Specilization is required"]
    },
    degree: {
        type: String,
        required: [true, "Degree is required"]
    },
    experienceYears: {
        type: Number,
        required: [true, "Experience years is required"]
    },
    bio: { type: String },
    consultationFee: {
        type: Number,
        required: [true, "Consultation fee is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const DoctorProfileModel: Model<IDoctorDocument> = mongoose.model<IDoctorDocument>('DoctorProfile', DoctorSchema);