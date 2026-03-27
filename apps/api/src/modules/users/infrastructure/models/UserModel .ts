import mongoose, { Schema, Document, Model, Query } from "mongoose";
import { IUser } from "../../domain/entities/IUser";
import bcrypt from "bcryptjs";
import { AppError } from "../../../../core/errors/AppError";
import crypto from "crypto";

// IUSER IS THE ENTITY (TO MAKE TYPE CHECKING)
// DOCUMENT IS THE MONGODB DOCUMENT (TO MAKE MONGODB OPERATIONS)
// IUSERDOCUMENT IS THE COMBINATION OF IUSER AND DOCUMENT (TO MAKE TYPE CHECKING AND MONGODB OPERATIONS)
export interface IUserDocument extends IUser, Document {
  id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // TO NOT SHOW PASSWORD IN QUERIES
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    phone: { type: String },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    photoPublicId: {
      type: String,
      default: null, // cause default photo hasn't publicId
    },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    // LINKING EACH USER TO HIS PROFILE DETAILS
    doctorProfileId: { type: Schema.Types.ObjectId, ref: "DoctorProfile" },
    patientProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PatientProfile",
    },
    adminProfileId: {
      type: Schema.Types.ObjectId,
      ref: "AdminProfile",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// HASH PASSWORD BEFORE SAVING
UserSchema.pre<IUserDocument>("save", async function () {
  if (!this.isModified("password")) return;

  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  } catch (error) {
    throw new AppError("error in hashing password", 500);
  }
});

// COMPARE PASSWORD
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// GENERATE RESET TOKEN
UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // ENCRYPT RESET TOKEN & SAVE IT IN DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // SET RESET TOKEN EXPIRY
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// NOW USER MODEL IS IUSER (TO MAKE TYPE CHECKING) AND DOCUMENT (TO MAKE MONGODB OPERATIONS)
export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  UserSchema,
);

// MIDDLEWARE TO IGNORE ALL INACTIVE USERS
// JUST RETURN THE ACTIVE USER WHEN USE (FIND, FindOne)
UserSchema.pre(/^find/, function (this: Query<any, any>) {
  // this refer to the current query
  (this as any).find({
    status: { $ne: "suspended" },
  });
});
