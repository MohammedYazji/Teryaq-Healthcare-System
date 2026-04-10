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

  async sendActivationToken(url: string, firstName: string) {
    const subject = "Welcome to Teryaq - Activate Your Account";
    const message = `
    Hello ${firstName},

    Welcome to Teryaq! We are excited to have you with us.
    To start booking appointments and accessing our healthcare services, please activate your account by clicking the link below:

    ${url}

    This link is valid for 24 hours. If you did not create an account, please ignore this email.

    Stay healthy,
    Teryaq Team
    `;

    await this.send(subject, message);
  }

  async sendPasswordReset(url: string) {
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${url}.\nIf you didn't forget your password, please ignore this email!`;
    await this.send(
      "Your password reset token (valid for 10 minutes)",
      message,
    );
  }

  async sendNewAppointmentAlert(
    patientName: string,
    date: string,
    time: string,
  ) {
    const message = `Hello Doctor,\n\nYou have a new appointment request.\n\nPatient: ${patientName}\nDate: ${date}\nTime: ${time}\n\nPlease login to your dashboard to accept or decline the request.`;
    await this.send("New Appointment Request - Teryaq", message);
  }

  async sendAppointmentConfirmed(
    doctorName: string,
    date: string,
    time: string,
  ) {
    const message = `Hello,\n\nYour appointment has been successfully confirmed!\n\nDoctor: ${doctorName}\nDate: ${date}\nTime: ${time}\n\nWe wish you a healthy life.`;
    await this.send("Appointment Confirmation - Teryaq", message);
  }

  async sendAppointmentCancelled(reason: string) {
    const message = `We regret to inform you that your appointment has been cancelled.\nReason: ${reason}\n\nYou can book a new appointment at a different time.`;
    await this.send("Appointment Update - Teryaq", message);
  }

  async sendRescheduledNotification(
    otherPartyName: string,
    newDate: string,
    newTime: string,
  ) {
    const message = `Hello,\n\nYour appointment has been rescheduled.\n\nUpdated Details:\nWith: ${otherPartyName}\nNew Date: ${newDate}\nNew Time: ${newTime}\n\nPlease check your dashboard for more details.`;
    await this.send("Appointment Rescheduled - Teryaq", message);
  }
}
