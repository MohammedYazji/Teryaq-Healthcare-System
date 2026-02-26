import nodemailer from "nodemailer";
import { config } from "../../config/env";

export class Email {
  private to: string;
  private from: string;

  constructor(user: { email: string }) {
    this.to = user.email;
    this.from = `Teryaq <${config.EMAIL_FROM}>`;
  }

  private newTransport() {
    // IN DEVELOPMENT USE MAILTRAP
    return nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: Number(config.EMAIL_PORT),
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    });
  }

  async send(subject: string, message: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset(url: string) {
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${url}.\nIf you didn't forget your password, please ignore this email!`;
    await this.send(
      "Your password reset token (valid for 10 minutes)",
      message,
    );
  }
}
