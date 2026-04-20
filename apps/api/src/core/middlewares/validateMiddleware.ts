import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(", ");
        return next(new AppError(message, 400));
      }
      next(error);
    }
};