


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
