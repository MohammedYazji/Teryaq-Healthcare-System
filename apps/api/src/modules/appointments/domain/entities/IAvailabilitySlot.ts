export interface IAvailabilitySlot {
    id?: string;
    doctorId?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}