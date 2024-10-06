import { User } from "./user.interface";

// Report model interface
export interface Report {
    id: string;
    userId: string;
    user: User;
    content: string;
    createdAt: Date;
  }