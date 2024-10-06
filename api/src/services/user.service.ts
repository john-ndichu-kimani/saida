import { Role, Status, User } from "../interfaces/user.interface";
import bcrypt from "bcryptjs";
import prisma from "../utils/init.prisma.util";

export class UserService {

  async fetchAllClients(
    page: number = 1,
    pageSize: number = 10,
    filter: any = {}
  ) {
    try {
      if (page < 1 || pageSize < 1) {
        return { error: "Invalid pagination parameters" };
      }

      const skip = (page - 1) * pageSize;
      const clients = await prisma.user.findMany({
        where: {
          role:Role.CLIENT,
          ...filter,
          
        },
        select:{
          id:true,
          profileImage:true,
          firstName:true,
          lastName:true,
          email:true,
          phoneNumber:true,
          status:true,
          bookingsAsClient:true
        
        },
        skip: skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      const totalUsers = await prisma.user.count({
        where: {
          ...filter,
        },
      });

      return {
        clients,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
        totalUsers,
      };
    } catch (e) {
      console.error("Error fetching users:", e);
      return { error: "An error occurred while fetching users" };
    }
  }

  async fetchAllCaregivers(
    page: number = 1,
    pageSize: number = 10,
    filter: any = {}
  ) {
    try {
      if (page < 1 || pageSize < 1) {
        return { error: "Invalid pagination parameters" };
      }

      const skip = (page - 1) * pageSize;
      const caregivers = await prisma.user.findMany({
        where: {
            role: 'CAREGIVER',  // Ensure the user has the CAREGIVER role
        },
        
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileBio: true,
          specialization: true,
          certificates: true,
          phoneNumber: true,
          profileImage: true,
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true,
              imageUrl: true,
              bookings:true
            }
          }
        },

        skip: skip,
        take: pageSize,
       
      });

      const totalUsers = await prisma.user.count({
        where: {
          ...filter,
        },
      });

      return {
        caregivers,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
        totalUsers,
      };
    } catch (e) {
      console.error("Error fetching users:", e);
      return { error: "An error occurred while fetching users" };
    }
  }
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage:true,
          lastLogin: true,
          phoneNumber:true,
      
        },
      });
  
      if (!user) {
        
        return {
          error: `User with the provided ID ${userId} was not found.`,
        };
      }
  
      // Return the user if found
      return {
        user,
      };
    } catch (error) {
      
      console.error("Error occurred while fetching user:", error);
      return {
        error: "An error occurred while fetching the user.",
      };
    }
  }
  

  // async updateUser(userId: string, updatedData: Partial<User>) {
  //   try {
  //     if (updatedData.password) {
  //       updatedData.password = bcrypt.hashSync(updatedData.password, 10);
  //     }

  //     const updatedUser = await prisma.user.update({
  //       where: { id: userId },
  //       data: {
  //         ...updatedData,
  //         updatedAt: new Date(),
  //       },
  //     });

  //     return {
  //       message: "User updated successfully",
  //       updatedUser,
  //     };
  //   } catch (e: any) {
  //     console.error("Error updating user:", e.message);
  //     return { error: "An error occurred while updating the user" };
  //   }
  // }

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
