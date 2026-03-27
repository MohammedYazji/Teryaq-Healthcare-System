import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { catchAsync } from "../utils/catchAsync";

// Restore in the memory
const multerStorage = multer.memoryStorage();

// Filter the files (for now we accept just images)
const multerFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maximum 5 mb
});

// Middleware to receive just an image
export const uploadSingleImage = (fieldName: string) =>
  upload.single(fieldName);

// Middleware to process the image (Resize & Format) using "sharp"
export const resizeImage = (width: number, height: number) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    // Change the file name and save it in buffer
    req.file.buffer = await sharp(req.file.buffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    next();
  });
