import mongoose, { Schema, Document, Model, Query } from "mongoose";
import { ISpecialization } from "../../domain/entities/ISpecialization";

export interface ISpecializationDocument extends ISpecialization, Document {}

const SpecializationSchema = new Schema<ISpecializationDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// MIDDLEWARE TO IGNORE ALL INACTIVE SPECIALiZATIONS
// JUST RETURN THE ACTIVE SPECIALiZATIONS WHEN USE (FIND, FindOne)
SpecializationSchema.pre(/^find/, function (this: Query<any, any>) {
  (this as any).find({ active: { $ne: false } });
});

export const SpecializationModel: Model<ISpecializationDocument> =
  mongoose.model<ISpecializationDocument>(
    "Specialization",
    SpecializationSchema,
  );
