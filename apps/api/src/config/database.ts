import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}