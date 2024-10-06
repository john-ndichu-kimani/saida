import { Booking } from "./appointment.interface";
import { Recommendation } from "./recommend.interface";
import { User } from "./user.interface";

// Caregiver model interface
export interface Caregiver {
    id: string;
    userId: string;
    user: User;
    profileBio?: string;
    specialization?: string;
    certificates: string[];
    bookings: Booking[];
    recommendationsReceived: Recommendation[];
  }