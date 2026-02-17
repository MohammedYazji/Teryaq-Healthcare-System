import express from "express";
import cors from "cors";
import { config } from "./config/env";

// SETUP EXPRESS
const app = express();

// GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.json());

// ROUTES
app.get('/', (req, res) => {
    res.send('Teryaq is here!');
});

// START SERVER
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});