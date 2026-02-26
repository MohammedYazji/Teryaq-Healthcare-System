import { IUserDocument } from "../modules/users/infrastructure/models/UserModel ";

declare global {
  namespace Express {
    interface Request {
      user: IUserDocument;
    }
  }
}
