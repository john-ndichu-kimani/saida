
import { Caregiver } from "./caregiver.interface";
import { User } from "./user.interface";

// Recommendation model interface
export interface Recommendation {
    id: string;
    clientId: string;
    client: User;
    caregiverId: string;
    caregiver: Caregiver;
    score: number;
    feedback?: string;
    createdAt: Date;
  }
  
  