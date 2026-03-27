import { UserModel } from "../../infrastructure/models/UserModel ";
import { AppError } from "../../../../core/errors/AppError";

class UserService {
  // UPDATE THE USER DATA
  async updateUserData(userId: string, updateData: any) {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedUser) {
      throw new AppError("User doesn't exist", 404);
    }
    return updatedUser;
  }

  // DELETE THE USER (SOFT DELETE)
  async deactivateUser(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { status: "suspended" });
  }
}

export const userService = new UserService();
