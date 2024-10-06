import { User } from "./user.interface";

// Message model interface
export interface Message {
    id: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    content: string;
    createdAt: Date;
  }