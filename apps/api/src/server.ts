import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./config/database";

const bootstrap = async () => {
    // SETUP EXPRESS
    const app = express();


    // CONNECT TO MONGODB
    await connectDB();

  
    // USE MIDDLEWARES
    app.use(express.json());
    app.use(cors());

    // ROUTES
    app.get('/', (req, res) => {
        res.send('Teryaq is here!');
    });

    // START SERVER
    app.listen(config.PORT, () => {
        console.log(`Server listening on port: ${config.PORT}`);
    });
};
bootstrap();