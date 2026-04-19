/**
 * Devices don't know each other so we need this file to link the patient device with the doctor
 */
import { Server, Socket } from "socket.io";
import { AuthService } from "../../modules/users/applicaiton/services/AuthService";
import { AppointmentModel } from "../../modules/appointments/infrastructure/models/AppointmentModel";

export class SocketService {
  // Singleton: ensure we have just one instance from socketServer
  private static io: Server;

  public static init(server: any) {
    // Allow those methods from front to not face cors issue
    this.io = new Server(server, {
      cors: {
        origin: "*", // TODO - Replace with Frontend URL in Production
        methods: ["GET", "POST"],
      },
    });

    // AUTHENTICATION MIDDLEWARE
    // THERE IS NO ANY CONNECTIONS WILL PASS WITHOUT TOKEN
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token)
        return next(new Error("Authentication error: No token provided"));

      try {
        const decoded = await AuthService.verifyToken(token);
        socket.data.user = decoded; // Save the user data into the socket to use later
        next();
      } catch (err) {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(
        `Authenticated user connected: ${socket.id} (User: ${socket.data.user.id})`,
      );
      // Listeners
      this.handleSignaling(socket);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  private static handleSignaling(socket: Socket) {
    // 1. Join in the Appointment Room (Signaling Room)
    // when patient and doctor share same appointment id
    // we add them in private room
    socket.on("join-appointment", async (appointmentId: string) => {
      const appointment = await AppointmentModel.findById(appointmentId);

      if (appointment && appointment.status === "scheduled") {
        socket.join(appointmentId);
        socket.emit("joined-successfully", { roomId: appointmentId });
        console.log(`User ${socket.id} joined room: ${appointmentId}`);
      } else {
        socket.emit("error", "This appointment is not active yet.");
      }
    });

    // 2. Send the WebRTC Offer from Dr to Patient or the  opposite
    // For example doctor device send offer include the video format, encoding which it support
    socket.on("video-offer", ({ offer, appointmentId }) => {
      socket.to(appointmentId).emit("video-offer", { offer, from: socket.id });
    });

    // 3. Send WebRTC Answer
    // the patient device receive the offer then response: yes i support this formats too
    socket.on("video-answer", ({ answer, appointmentId }) => {
      socket
        .to(appointmentId)
        .emit("video-answer", { answer, from: socket.id });
    });

    // 4. Pass ICE Candidates (Direct connection)
    // after this the two devices will share their IPs to connect with each others without needing the server
    socket.on("new-ice-candidate", ({ candidate, appointmentId }) => {
      // Send this msg to all exist in this root expect the user who send it
      socket.to(appointmentId).emit("new-ice-candidate", candidate);
    });
  }
}
