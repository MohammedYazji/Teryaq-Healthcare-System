import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../application/services/AuthService";
import { catchAsync } from "../../../../core/utils/catchAsync";

export class AuthController {
  private authService: AuthService;

  constructor() {
    // INTIALIZE AUTH SERVICE OBJECT TO USE ITS METHODS
    this.authService = new AuthService();
  }

  // SIGNUP CONTROLLER
  signup = catchAsync(async (req: Request, res: Response) => {
    // CALL AUTH SERVICE SIGNUP METHOD THEN RETURN THE RESULT
    const result = await this.authService.signup(
      req.body,
      req.protocol,
      req.get("host") as string,
    );

    res.status(201).json({
      status: "success",
      token: result.token,
      data: {
        user: result.data.user,
      },
    });
  });

  // LOGIN CONTROLLER
  login = catchAsync(async (req: Request, res: Response) => {
    // CALL AUTH SERVICE LOGIN METHOD THEN RETURN THE RESULT
    const result = await this.authService.login(req.body);

    res.status(200).json({
      status: "success",
      token: result.token,
      data: {
        user: result.data.user,
      },
    });
  });

  // ACTIVATE ACCOUNT
  activateAccount = catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const token = req.params.token as string;

      await this.authService.activateAccount(token);

      res.status(200).json({
        status: "success",
        message: "Your account is now active! You can use all features.",
      });
    },
  );

  // UPDATE PASSWORD CONTROLLER
  updatePassword = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      const result = await this.authService.updatePassword(req.user.id, {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        newPasswordConfirm: req.body.newPasswordConfirm,
      });

      res.status(200).json({
        status: "success",
        token: result.token,
        data: {
          user: result.data.user,
        },
      });
    },
  );

  // FORGOT PASSWORD CONTROLLER
  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.forgotPassword(
      req.body.email,
      req.protocol,
      req.get("host") as string,
    );

    res.status(200).json(result);
  });

  // RESET PASSWORD CONTROLLER
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req.params.token as string;

    const result = await this.authService.resetPassword(token, {
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(200).json(result);
  });
}
