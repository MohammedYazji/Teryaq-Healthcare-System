import dotenv from "dotenv";
import { AppError } from "../core/errors/AppError";

// READ ENVIRONMENT VARIABLES
dotenv.config();

// EXPORT ENVIRONMENT VARIABLES AS OBJECT
export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
}

if (!config.MONGO_URI) {
  throw new AppError('MONGO_URI is not defined', 500);
}

if(!config.JWT_SECRET || !config.JWT_EXPIRES_IN) {
    throw new AppError('JWT_SECRET or JWT_EXPIRES_IN is not defined', 500);
}
