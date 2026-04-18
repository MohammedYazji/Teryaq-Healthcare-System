import jwt from "jsonwebtoken";
import { config } from "../../../../config/env";
import mongoose from "mongoose";
import { UserModel } from "../../infrastructure/models/UserModel ";
import { AppError } from "../../../../core/errors/AppError";
import { Email } from "../../../../core/utils/email";
import crypto from "crypto";
import { doctorService } from "../../../doctors/application/services/DoctorService";
import { patientService } from "../../../patients/application/services/PatientService";

export class AuthService {
  // GENERATE JWT TOKEN
  private generateToken(id: string): string {
    const secret = config.JWT_SECRET as string;
    const expiresIn = config.JWT_EXPIRES_IN as any;

    return jwt.sign({ id }, secret, { expiresIn });
  }

  // SIGNUP
  async signup(paylod: any, protocol: string, host: string) {
    // TO ENSURE IMPLEMENT ALL STEPS OR CANCEL THE TRANSACTION
    // WE NEED TO START A TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // SPLIT USER DATA INTO MAIN USER AND PROFILE DATA
      const { doctorInfo, patientInfo, ...userData } = paylod;

      // MAKE THE MAIN USER
      const [newUser] = await UserModel.create([userData], { session });

      // GENERATE ACTIVATION TOKEN
      const activationToken = newUser.generateActivationToken();

      // CREATE PROFILE BASED ON USER ROLE
      if (newUser.role === "doctor") {
        if (!doctorInfo)
          throw new AppError("doctor information is required", 400);

        const profile = await doctorService.createProfile(
          {
            userId: newUser._id as mongoose.Types.ObjectId,
            ...doctorInfo,
          },
          session,
        );
        newUser.doctorProfileId = profile._id.toString();
      } else if (newUser.role === "patient") {
        if (!patientInfo)
          throw new AppError("patient information is required", 400);

        const profile = await patientService.createProfile(
          {
            userId: newUser._id as mongoose.Types.ObjectId,
            ...patientInfo,
          },
          session,
        );
        newUser.patientProfileId = profile._id.toString();
      }

      // SAVE THE USER
      await newUser.save({ session });

      // COMMIT THE TRANSACTION
      await session.commitTransaction();
      session.endSession();

      // AFTER COMMIT THE TRANSACTION SEND ACTIVATION EMAIL
      // TO NOT DELAYED THE RESPONSE
      try {
        const activationURL = `${protocol}://${host}/api/v1/auth/activate/${activationToken}`;
        await new Email(newUser).sendActivationToken(
          activationURL,
          newUser.firstName,
        );
      } catch (error) {
        console.error(
          "Email failed to send. Please contact support to activate your account.",
          error,
        );
      }

      // GENERATE TOKEN & SEND DATA WITHOUT PASSWORD
      const token = this.generateToken(newUser._id.toString());

      newUser.password = undefined;

      return {
        status: "success",
        token,
        message: "Account created! Please check your email to activate.",
        data: { user: newUser },
      };
    } catch (error: any) {
      // IF ERROR HAPPENS CANCEL ALL STEPS WE MADE
      await session.abortTransaction();
      session.endSession();
      throw new AppError(error.message || "Something went wrong", 400);
    }
  }

  // LOGIN
  async login(userData: any) {
    const { email, password } = userData;

    // ENSURE EMAIL AND PASSWORD ARE PROVIDED
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    // GET THE USER WITH THE PROVIDED EMAIL AND SELECT THE PASSWORD TO BE SHOWN CAUSE IT'S HIDDEN BY DEFAULT
    const user = await UserModel.findOne({ email }).select("+password");

    // CHECK IF USER EXISTS AND PASSWORD MATCHES
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }

    // CHECK IF THE USER NOT EXIST
    if (user.status === "suspended") {
      throw new AppError(
        "Your account has been suspended or deleted. Please contact support.",
        403,
      );
    }

    // GENERATE TOKEN
    const token = this.generateToken(user._id.toString());

    // SEND DATA WITHOUT PASSWORD
    (user as any).password = undefined;

    return {
      status: "success",
      token,
      data: { user },
    };
  }

  // ACTIVATE ACCOUNT
  async activateAccount(token: string) {
    // HASH THE TOKEN TO COMPARE WITH ONE IN THE DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // UN-FILTER THE SUSPENDED ACCOUNTS TO CAN ACTIVATE THEM
    const user = await UserModel.findOne({
      accountActivationToken: hashedToken,
      accountActivationExpires: { $gt: new Date() },
    }).setOptions({ unfiltered: true });

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    // ACTIVATE THE ACCOUNT AND REMOVE THR TOKEN INFORMATION
    user.status = "active";
    user.accountActivationToken = undefined;
    user.accountActivationExpires = undefined;

    // PREVENT VALIDATION FOR PASSWORD WHEN SAVE
    await user.save({ validateBeforeSave: false });

    return {
      status: "success",
      message: "Account activated successfully!",
    };
  }

  // UPDATE PASSWORD
  async updatePassword(userId: string, data: any) {
    const { currentPassword, newPassword, newPasswordConfirm } = data;

    // GET THE USER AND SELECT THE PASSWORD TO BE SHOWN CAUSE IT'S HIDDEN BY DEFAULT
    // CHECK IF THE CURRENT PASSWORD
    const user = await UserModel.findById(userId).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new AppError("Invalid current password", 401);
    }

    // UPDATE THE PASSWORD & SAVE IT
    if (newPassword !== newPasswordConfirm) {
      throw new AppError("Passwords do not match", 400);
    }
    user.password = newPassword;
    await user.save();

    // GENERATE A NEW TOKEN
    const token = this.generateToken(user._id.toString());

    // SEND DATA WITHOUT PASSWORD
    (user as any).password = undefined;

    return {
      status: "success",
      token,
      data: { user },
    };
  }

  // FORGOT PASSWORD
  async forgotPassword(email: string, protocl: string, host: string) {
    // GET THE USER BY EMAIL
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("There is no user with this email address.", 404);
    }

    // GENERATE THE RESET TOKEN
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // SEND THE RESET TOKEN TO THE USER EMAIL
    try {
      const resetURL = `${protocl}://${host}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user).sendPasswordReset(resetURL);

      return {
        status: "success",
        message: "Token sent to email",
      };
    } catch (error) {
      // IF ERROR HAPPENS CANCEL THE TOKEN
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(
        "There was an error sending the email, please try again later!",
        500,
      );
    }
  }

  // RESET PASSWORD
  async resetPassword(token: string, data: any) {
    // HASHED THE RESET PASSWORD TOKEN TO COMPARE IT WITH THE ONE IN THE DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // GET THE USER BASED ON THE HASHED TOKEN
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // CHECK IF THE USE EXIST
    if (!user) {
      throw new AppError("Token isn't valid or expired", 400);
    }

    // SET THE NEW PASSWORD AND DELETE THE TOKEN
    if (data.password !== data.passwordConfirm) {
      throw new AppError("Passwords don't match", 400);
    }

    user.password = data.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // SAVE THE USER
    await user.save();

    // GENERATE TOKEN TO LOGIN AND TO BE AUTHENTICATED
    // AND RETURN THE RESPONSE
    const accessToken = this.generateToken(user._id.toString());

    (user as any).password = undefined;

    return {
      status: "success",
      token: accessToken,
      data: { user },
    };
  }
}
