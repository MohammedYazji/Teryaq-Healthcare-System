import jwt from "jsonwebtoken";
import { config } from "../../../../config/env";
import mongoose from "mongoose";
import { UserModel } from "../../infrastructure/models/UserModel ";
import { DoctorProfileModel } from "../../infrastructure/models/DoctorModel";
import { PatientProfileModel } from "../../infrastructure/models/PatientModel";
import { AppError } from "../../../../core/errors/AppError";

export class AuthService {
    // GENERATE JWT TOKEN
    private generateToken(id: string): string {
        const secret = config.JWT_SECRET as string;
        const expiresIn = config.JWT_EXPIRES_IN as any;

        return jwt.sign(
            {id}, 
            secret,
            { expiresIn }
        );
    }

    // SIGNUP
    async signup(userData: any){
        // TO ENSURE IMPLEMENT ALL STEPS OR CANCEL THE TRANSACTION
        // WE NEED TO START A TRANSACTION
        const session = await mongoose.startSession();
       session.startTransaction(); 

       try {
        // MAKE THE MAIN USER
        const [newUser] = await UserModel.create([userData], { session });

        // CREATE PROFILE BASED ON USER ROLE
        let profileId;
        if(newUser.role === 'doctor'){
            const [doctorProfile] = await DoctorProfileModel.create([{ userId: newUser._id.toString() }], { session });
            profileId = doctorProfile._id;
            newUser.doctorProfileId = profileId.toString();
        } else if(newUser.role === 'patient'){
            const [patientProfile] = await PatientProfileModel.create([{ userId: newUser._id.toString() }], { session });
            profileId = patientProfile._id;
            newUser.patientProfileId = profileId.toString();
        }

        // SAVE THE USER
        await newUser.save({session});

        // COMMIT THE TRANSACTION
        await session.commitTransaction();
        session.endSession();

        // GENERATE TOKEN & SEND DATA WITHOUT PASSWORD
        const token = this.generateToken(newUser._id.toString());

        newUser.password = undefined;

        return {
            status: 'success',
            token,
            data: {user: newUser}
        };
       } catch (error: any) {
        // IF ERROR HAPPENS CANCEL ALL STEPS WE MADE
        await session.abortTransaction();
        session.endSession();
        throw new AppError(error.message || "Something went wrong", 400);
       }
    }
}


