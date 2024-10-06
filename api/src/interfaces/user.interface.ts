import { Booking, CaregiverService } from "./appointment.interface";
import { Caregiver } from "./caregiver.interface";
import { Message } from "./message.interface";
import { Payment } from "./payment.interface";
import { Recommendation } from "./recommend.interface";
import { VideoCall } from "./vedio.interface";

export interface User {
  id: string;
  googleId?: string;
  facebookId?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  email: string;
  password: string;
  role: Role;
  isVerified: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  
  // Caregiver specific fields (optional)
  profileBio?: string;
  specialization?: string;
  certificates?: string[];
  services?: CaregiverService[];

  // Relationships
  payments: Payment[];
  messagesSent: Message[];
  messagesReceived: Message[];
  videoCallsMade: VideoCall[];
  videoCallsReceived: VideoCall[];
  reports: Report[];
  recommendationsGiven: Recommendation[];
  bookings: Booking[];
  caregiver?: Caregiver;
}

export enum Role {
  CLIENT = "CLIENT",
  CAREGIVER = "CAREGIVER",
  ADMIN = "ADMIN",
}

export interface LoginDetails {
  email: string;
  password: string;
}

export interface TokenDetails {
  id: string;
  email: string;
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
