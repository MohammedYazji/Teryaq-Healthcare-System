import dotenv from "dotenv";
import { AppError } from "../core/errors/AppError";

// READ ENVIRONMENT VARIABLES
dotenv.config();

// EXPORT ENVIRONMENT VARIABLES AS OBJECT
export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

if (!config.MONGO_URI) {
  throw new AppError("MONGO_URI is not defined", 500);
}

if (!config.JWT_SECRET || !config.JWT_EXPIRES_IN) {
  throw new AppError("JWT_SECRET or JWT_EXPIRES_IN is not defined", 500);
}

if (
  !config.CLOUDINARY_CLOUD_NAME ||
  !config.CLOUDINARY_API_KEY ||
  !config.CLOUDINARY_API_SECRET
) {
  throw new AppError("Cloudinary configurations are missing", 500);
}
