import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import { AppError } from "../errors/AppError";
import { catchAsync } from "../utils/catchAsync";
import { UserModel } from "../../modules/users/infrastructure/models/UserModel ";

// PROTECT ROUTES
export const protect = catchAsync(async(req: any, res: Response, next: NextFunction) => {
    // ENSURE THE TOKEN EXISTS
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 

    if(!token) {
        return next(new AppError('Please log in to get access', 401));
    }

    // ENSURE THE TOKEN IS VALID
    const decoded: any = jwt.verify(token, config.JWT_SECRET as string);

    // ENSURE THE USER STILL EXISTS
    const currentUser = await UserModel.findById(decoded.id);

    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }

    // GRANT ACCESS & STORE THE USER INFORMATION IN THE REQUEST OBJECT TO USE IT IN THE NEXT MIDDLEWARE OR ROUTE HANDLER
    req.user = currentUser;
    next();

})

// GRANT ACCESS TO SPECIFIC ROLES
export const restrictTo = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}
