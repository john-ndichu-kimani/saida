
import { Role, Status, User } from "../interfaces/user.interface";
import bcrypt from "bcryptjs";
import prisma from "../utils/init.prisma.util";


export class UserService {


  async fetchAllUsers(page: number = 1, pageSize: number = 10, filter: any = {}) {
    try {
      if (page < 1 || pageSize < 1) {
        return { error: "Invalid pagination parameters" };
      }

      const skip = (page - 1) * pageSize;
      const users = await prisma.user.findMany({
        where: {
          role: Role.CLIENT,
          ...filter,
        },
        skip: skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      const totalUsers = await prisma.user.count({
        where: {
          role: Role.CLIENT,
          ...filter,
        },
      });

      return {
        users,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
        totalUsers,
      };
    } catch (e: any) {
      console.error("Error fetching users:", e.message);
      return { error: "An error occurred while fetching users" };
    }
  }

  async updateUser(userId: string, updatedData: Partial<User>) {
    try {
      if (updatedData.password) {
        updatedData.password = bcrypt.hashSync(updatedData.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updatedData,
          updatedAt: new Date(),
        },
      });

      return {
        message: "User updated successfully",
        updatedUser,
      };
    } catch (e: any) {
      console.error("Error updating user:", e.message);
      return { error: "An error occurred while updating the user" };
    }
  }

  async activateUser(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: Status.ACTIVE },
      });

      return { message: "User account activated successfully", user };
    } catch (e: any) {
      console.error("Error activating user:", e.message);
      return { error: "Error occurred while activating user account" };
    }
  }

  async deactivateUser(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status: Status.INACTIVE },
      });

      return { message: "User account deactivated successfully", user };
    } catch (e: any) {
      console.error("Error deactivating user:", e.message);
      return { error: "Error occurred while deactivating user account" };
    }
  }
}
