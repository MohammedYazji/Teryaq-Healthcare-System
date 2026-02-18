import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import { globalErrorHandler } from "./core/middlewares/errorMiddleware";
import { AppError } from "./core/errors/AppError";

const bootstrap = async () => {
    // SETUP EXPRESS
    const app = express();


    // CONNECT TO MONGODB
    await connectDB();

  
    // USE MIDDLEWARES
    app.use(express.json());
    app.use(cors());

    // ROUTES
    app.get('/', (req: Request, res: Response) => {
        res.send('Teryaq is here!');
    });

    // HANDLE UNHANDLED ROUTES
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    });

    // GLOBAL ERROR HANDLER
    app.use(globalErrorHandler);

    // START SERVER
    app.listen(config.PORT, () => {
        console.log(`Server listening on port: ${config.PORT}`);
    });
};
bootstrap();