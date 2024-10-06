import { User } from "./user.interface";

// Payment model interface
export interface Payment {
    id: string;
    userId: string;
    user: User;
    amount: number;
    status: PaymentStatus;
    paymentDate: Date;
    transactionId?: string | null;
  }

  export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    REVERSED = "REVERSED",
  }