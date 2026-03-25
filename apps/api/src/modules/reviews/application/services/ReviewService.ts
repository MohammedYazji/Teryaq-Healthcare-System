import { AppError } from "../../../../core/errors/AppError";
import { AppointmentModel } from "../../../appointments/infrastructure/models/AppointmentModel";
import { ReviewModel } from "../../infrastructure/models/ReviewModel";

export class ReviewService {
  // NEW RATE FOR COMPLETED APPOINTMENT
  static async createReview(patientId: string, data: any) {
    // Ensure the appointment exist, for this patient and completed
    const appointment = await AppointmentModel.findOne({
      _id: data.appointmentId,
      patientId,
      status: "completed",
    });

    if (!appointment) {
      throw new AppError(
        "You can only review your own completed appointments",
        400,
      );
    }

    // Create a review (static method will update the doctor profile automatically)
    const review = await ReviewModel.create({
      ...data,
      patientId,
      doctorId: appointment.doctorId, // Get id from the appointment to be ensure it's the right one
    });

    return review;
  }

  // Get reviews for specific doctor
  static async getDoctorReviews(doctorId: string) {
    return await ReviewModel.find({ doctorId })
      .populate("patientId", "firstName lastName photo") // Show the patient information
      .sort("-createdAt");
  }
}
