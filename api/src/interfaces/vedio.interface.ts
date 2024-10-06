import { User } from "./user.interface";

// VideoCall model interface
export interface VideoCall {
    id: string;
    callerId: string;
    caller: User;
    receiverId: string;
    receiver: User;
    scheduledAt: Date;
    duration?: number;
    status: VideoCallStatus;
    createdAt: Date;
  }

enum VideoCallStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
  }