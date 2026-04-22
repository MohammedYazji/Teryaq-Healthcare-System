import { AppError } from "../../../../core/errors/AppError";
import { AvailabilityModel } from "../../infrastructure/models/AvailabilityModel";

export class AvailabilityService {
  // HELPER FUNCTION TO CONVERT HH:MM STRING TO MINUTES FOR EASY CALCULATION
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // HELPER FUNCTION TO CONVERT MINUTES BACK TO HH:MM FORMAT
  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  // GENERATES AND SAVES MULTIPLE AVAILABILITY SLOTS FOR A DOCTOR
  static async createBulkSlots(
    doctorId: string,
    data: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
    },
  ) {
    const { dayOfWeek, startTime, endTime, durationMinutes } = data;

    // CONVERT TIMES TO MINUTES FOR COMPARISON AND LOOPING
    let currentMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (currentMinutes >= endMinutes) {
      throw new AppError("Start time must be before end time", 400);
    }

    // CHECK IF THE DOCTOR ALREADY HAS GENERATED SLOTS FOR THIS DAY TO AVOID CONFLICTS
    const existingSlots = await AvailabilityModel.findOne({
      doctorId,
      dayOfWeek,
    });
    if (existingSlots) {
      throw new AppError(
        `Slots for ${dayOfWeek} already exist. Please update them instead.`,
        400,
      );
    }

    const slotsToCreate = [];

    // GENERATE SLOTS LOOP
    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotStartTime = this.minutesToTime(currentMinutes);
      const slotEndTime = this.minutesToTime(currentMinutes + durationMinutes);

      slotsToCreate.push({
        doctorId,
        dayOfWeek,
        startTime: slotStartTime,
        endTime: slotEndTime,
        isAvailable: true,
      });

      // Advance to the next slot
      currentMinutes += durationMinutes;
    }

    // BULK INSERT INTO THE DB
    return await AvailabilityModel.insertMany(slotsToCreate);
  }

  // GET THE AVAILABLE SLOTS FOR A DOCTOR
  static async getDoctorAvailability(
    doctorId: string,
    onlyAvailable: boolean = false,
    dayOfWeek?: string, // AS OPTIONAL PARAMETER
  ) {
    const query: any = { doctorId };

    // FILTERED OUT THE BOOKED SLOTS
    if (onlyAvailable) {
      query.$or = [
        { isAvailable: true },
        {
          status: "reserved",
          reservedUntil: { $lt: new Date() },
        },
      ];
    }
    // FILTER BY DAY IF PROVIDED
    if (dayOfWeek) query.dayOfWeek = dayOfWeek?.toLowerCase();

    return await AvailabilityModel.find(query).sort({ startTime: 1 });
  }

  // UPPDATE THE DOCTOR CURRENT AVAILABILITY
  static async updateSlot(slotId: string, doctorId: string, updateData: any) {
    const slot = await AvailabilityModel.findOne({ _id: slotId, doctorId });

    if (!slot) {
        throw new AppError('Slot not found or you do not have permission to update it', 404);
    }

    // Check if the slot is booked
    if (slot.status === 'booked') {
        throw new AppError('Cannot update a booked and confirmed slot.', 400);
    }

    // Check if the slot is reserved and not expired
    const isCurrentlyReserved = slot.status === 'reserved' && slot.reservedUntil && slot.reservedUntil > new Date();
    if (isCurrentlyReserved) {
        throw new AppError('This slot is currently being processed for checkout, cannot update it.', 400);
    }
    
    return await AvailabilityModel.findByIdAndUpdate(slotId, updateData, {
        new: true,
        runValidators: true
    });
}

  // DELETE THE DOCTOR CURRENT AVAILABILITY (IF NOT BOOKED)
  static async deleteSlot(slotId: string, doctorId: string) {
    const slot = await AvailabilityModel.findOne({ _id: slotId, doctorId });

    if (!slot) {
        throw new AppError('Slot not found or you do not have permission', 404);
    }

    // Check if the slot is booked
    if (slot.status === 'booked') {
        throw new AppError('Cannot delete a slot that has a confirmed booking.', 400);
    }

    // Check if the slot is reserved and not expired
    const isCurrentlyReserved = slot.status === 'reserved' && slot.reservedUntil && slot.reservedUntil > new Date();
    
    if (isCurrentlyReserved) {
        throw new AppError('Cannot delete a slot that is currently being processed for checkout.', 400);
    }

    await AvailabilityModel.findByIdAndDelete(slotId);
}
}
