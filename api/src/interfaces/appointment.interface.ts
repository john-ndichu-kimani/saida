import { Caregiver } from "./caregiver.interface";
import { PaymentStatus } from "./payment.interface";
import { User } from "./user.interface";

// Enum for Booking Status
export enum BookingStatus {
  PENDING = "PENDING",
  PENDING_PAYMENT="PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}


// Booking model interface
export interface Booking {
  id: string;
  serviceId?: string;
  service: CaregiverService;
  clientId: string;
  client: User;
  caregiverId: string;
  caregiver: Caregiver;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaregiverService {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}
