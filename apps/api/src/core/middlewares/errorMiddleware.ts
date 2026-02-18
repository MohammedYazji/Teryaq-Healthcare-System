import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/env';
import { handleValidationErrorDB } from '../errors/errorHandlers';

// SEND ERROR FOR DEVELOPMENT
// SEND ALL THE ERROR DETAILS TO THE CLIENT
const sendDevError = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack, // include the stack trace
    error: err, // include the error object
  });
};

// SEND ERROR FOR PRODUCTION
// SEND ONLY SIMPLE MESSAGE TO THE CLIENT
const sendProdError = (err: any, res: Response) => {
  // FOR OPERATIONAL ERRORS (THAT COME FROM OUR APPERROR)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
  // FOR NON-OPERATIONAL ERRORS (THAT COME FROM EXTERNAL SYSTEMS) `BUG`
  else {
    // LOG THE ERROR IN HOSTING CONSOLE
    console.error("Error 💥", err); 
    // SEND A GENERIC ERROR MESSAGE TO THE CLIENT
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.NODE_ENV === "development") {
    sendDevError(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === "ValidationError") error = handleValidationErrorDB(error);

    sendProdError(error, res);
  }
};