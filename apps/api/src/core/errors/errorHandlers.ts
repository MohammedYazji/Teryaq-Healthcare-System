import { AppError } from "../errors/AppError";

export const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};