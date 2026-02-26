import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../../core/utils/catchAsync";
import { AppError } from "../../../../core/errors/AppError";
import { userService } from "../../applicaiton/services/UserService";

class UserController {
  // METHOD TO FILTER FIELDS
  // TO RESTRICT SENSITIVE ROLE FROM CHANGE LIKE 'PASSWORD'
  private filterObj = (obj: any, ...allowedFields: string[]) => {
    const newObj: any = {};

    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

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

      // Allow to update the allowed fields
      const filteredBody = this.filterObj(req.body, "name", "email");

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
