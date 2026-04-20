import { z } from "zod";

// REGEX To Validate ID
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// Schema for signup process
export const signupSchema = z.object({
  // Basic Info
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string(),
  role: z.enum(["doctor", "patient"]),
  phone: z.string().optional(),
  // Doctor profile fields
  doctorInfo: z.object({
    specialization: objectId,
    degree: z.string().min(2, "Degree is required"),
    experienceYears: z.number().min(0),
    bio: z.string().min(10, "Bio is too short"),
    consultationFee: z.number().min(0),
    qualifications: z.array(z.string()).nonempty("Add at least one qualification")
  }).optional(),
  // Patient profile fields
  patientInfo: z.object({
    emergencyContactPhone: z.string(),
    emergencyContact: z.string().email("Invalid emergency email")
  }).optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Schema for booking process
export const bookingSchema = z.object({
  slotId: objectId,
  reason: z.string().min(5, "Please provide a valid reason"),
  appointmentDate: z.string().optional(), 
});