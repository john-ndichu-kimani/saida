// services/authService.ts
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../utils/init.prisma.util';
import bcryptjs from 'bcryptjs';
import { LoginDetails, Role, Status, User } from '../interfaces/user.interface';
import sendEmail from './mail.service';

import { Response } from 'express';
import { generateTokenAndSetCookie } from '../utils/generateToken';
import { use } from 'passport';

export class AuthService {
  async registerUser(user: User) {
    try {
      // Check if email already exists
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUserWithEmail) {
        return { success: false, message: 'User already exists' };
      }

      // Generate ID, hash password and verificationToken
      const user_id = uuidv4();
      const hashed_password = bcryptjs.hashSync(user.password, 10);
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser = await prisma.user.create({
        data: {
          id: user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          password: hashed_password,
          role: Role.CLIENT,
          profileImage: user.profileImage,
          isVerified: false,
          status: Status.ACTIVE,
          verificationToken,
          verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Send verification email
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email!',
        template: 'verifyEmail',
        context: {
          name: `${user.firstName} ${user.lastName}`,
          verificationToken,
        },
      });

      return {
        success: true,
        message: 'User account created successfully. Please verify your email.',
        user: {
          ...newUser,
          password: undefined,
        },
        verificationToken,
      };
    } catch (e) {
      console.error('Error registering user:', e);
      return { error: 'An error occurred while creating the user' };
    }
  }

  async verifyEmail(code: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: code,
          verificationTokenExpiresAt: { gt: new Date() },
        },
      });
      if (!user) {
        return { error: 'Invalid or expired verification code' };
      }

      if (user.isVerified) {
        return { message: 'Account is already verified', user };
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiresAt: null,
        },
      });

      // Send welcome email
      await sendEmail({
        to: user.email,
        subject: 'Welcome To Saida HealthCare Agency',
        template: 'welcome',
        context: {
          name: `${user.firstName} ${user.lastName}`,
        },
      });

      return {
        success: true,
        message: 'Account verified successfully',
        user: {
          ...updatedUser,
          password: undefined,
        },
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      return { error: 'An error occurred while verifying the email' };
    }
  }

  async loginUser(res: Response, logins: LoginDetails) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: logins.email,
        },
      });
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      if(!user.isVerified){
        return { success: false, message: 'Your account is unverified!' };
      }

      // Compare password
      const isPasswordValid = bcryptjs.compareSync(logins.password, user.password);

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      const token = generateTokenAndSetCookie(res, {
        id:user.id,
        email:user.email,
        
      });
     
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      return {
        success: true,
        message: 'Logged in successfully',
        token,
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { error: 'Internal server error' };
    }
  }

  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: resetTokenExpiresAt,
        },
      });
 
      const resetUrl = `${process.env.FRONTEND_URL}/${resetToken}`;

      // Send reset password email
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        template: 'resetPassword',
        context: {
          name: `${user.firstName} ${user.lastName}`,
          resetUrl,
        },
      });

      return {
        success: true,
        message: 'Password reset link sent to your email',
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { error: 'An error occurred while sending the password reset email' };
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpiresAt: { gt: new Date() },
        },
      });

      if (!user) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      const hashedPassword = bcryptjs.hashSync(password, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiresAt: null,
        },
      });

      // Send reset success email
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful',
        template: 'resetSuccess',
        context: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      });

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: 'An error occurred while resetting the password' };
    }
  }

  async checkAuth(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          lastLogin: true,
        },
      });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return { success: true, user };
    } catch (error) {
      console.log('Error in checkAuth', error);
      return { success: false, message: 'Internal server error' };
    }
  }
}
