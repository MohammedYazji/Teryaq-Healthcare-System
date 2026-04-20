import { filterObj } from "./../../../../core/utils/filterObject";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";
import { userService } from "../../application/services/UserService";
import { CloudinaryService } from "../../../../core/services/CloudinaryService";

class UserController {
  // MIDDLEWARE TO GET THE CURRENT AUTHENTICATED USER DATA
  // UserController.ts
  getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json({
        status: "success",
        data: {
          user: req.user,
        },
      });
    },
  );

  // UPDATE THE CURRENT AUTHENTICATED USER DATA
  updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Prevent update the password
      if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route not for updating password", 400));
      }

      // Prevent update the status
      if (req.body.status) {
        return next(new AppError("This route not for updating status", 400));
      }

      // Allow to update the allowed fields
      const filteredBody = filterObj(
        req.body,
        "firstName",
        "lastName",
        "email",
      );

      // Process the photo if the middleware put it in buffer
      if (req.file) {
        // upload the photo to 'users' folder in cloudinary
        const result = await CloudinaryService.uploadStream(
          req.file.buffer,
          "users",
        );

        // Store the url and the id of the photo in the DB
        filteredBody.photo = result.secure_url;
        filteredBody.photoPublicId = result.public_id;

        // To save some space in cloudinary remove the past photo if exist
        // so this the id the old one (from DB) before save the new one
        if (req.user.photoPublicId) {
          await CloudinaryService.deleteImage(req.user.photoPublicId);
        }
      }

      // Apply the service logic with those allowed fields
      const updatedUser = await userService.updateUserData(
        req.user.id,
        filteredBody,
      );

      // Return the user data after apply the changes
      res.status(200).json({
        status: "success",
        data: { user: updatedUser },
      });
    },
  );

  // DELETE THE CURRENT AUTHENTICATED USER BY SUSPENDED HIS ACCOUNT
  deleteMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      await userService.deactivateUser(req.user.id);
      res.status(204).json({
        status: "success",
        data: null,
      });
    },
  );
}

export const userController = new UserController();
