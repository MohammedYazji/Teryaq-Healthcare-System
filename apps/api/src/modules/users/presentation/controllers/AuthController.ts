import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../applicaiton/services/AuthService";
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
        const result = await this.authService.signup(req.body);

        res.status(201).json({
            status: "success",
            token: result.token,
            data: {
                user: result.data.user
            }
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
                user: result.data.user
            }
        });
    });

    // UPDATE PASSWORD CONTROLLER
    updatePassword = catchAsync(async (req: any, res: Response, next: NextFunction) => {
        const result = await this.authService.updatePassword(req.user.id, {
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword,
            newPasswordConfirm: req.body.newPasswordConfirm
        });

        res.status(200).json({
            status: "success",
            token: result.token,
            data: {
                user: result.data.user
            }
        });
    });
}
