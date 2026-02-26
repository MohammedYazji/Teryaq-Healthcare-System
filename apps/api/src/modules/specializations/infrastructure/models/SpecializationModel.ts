import mongoose, {Schema, Document, Model} from "mongoose";
import { ISpecialization } from "../../domain/entities/ISpecialization";

export interface ISpecializationDocument extends ISpecialization, Document {}

const SpecializationSchema = new Schema<ISpecializationDocument>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const SpecializationModel: Model<ISpecializationDocument> = mongoose.model<ISpecializationDocument>('Specialization', SpecializationSchema);