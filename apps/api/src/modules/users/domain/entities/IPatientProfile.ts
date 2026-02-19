export interface IPatientProfile {
    id?: string;
    userId?: string;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: string;
    emergencyContactPhone?: string;
}