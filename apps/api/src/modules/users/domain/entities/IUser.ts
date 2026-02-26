export type UserRole = 'admin' | 'doctor' | 'patient';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type UserGender = 'male' | 'female';

export interface IUser {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    gender?: UserGender;
    photo?: string;
    status: UserStatus;
    passwordResetToken?: string;
    passwordResetExpires?: Date;

    // METHODS
    generatePasswordResetToken(): string;
    comparePassword(password: string): Promise<boolean>;

    // EACH USER MUST BE ONE OF THESE
    doctorProfileId?: string;
    patientProfileId?: string;
    adminProfileId?: string;

    createdAt?: Date;
    updatedAt?: Date;
}
