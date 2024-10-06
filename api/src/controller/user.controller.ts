import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { Role, Status, User } from '../interfaces/user.interface';

const userService = new UserService();

export class UserController {

  // Fetch all users with pagination and optional filters
  async fetchAllClients(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};

      const result = await userService.fetchAllClients(page, pageSize, filter);

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (e) {
      console.error("Error in fetchAllClients controller:", e);
      return res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }

    // Fetch all users with pagination and optional filters
    async fetchAllCaregivers(req: Request, res: Response) {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
  
        const result = await userService.fetchAllCaregivers(page, pageSize, filter);
  
        if (result.error) {
          return res.status(400).json(result);
        }
  
        return res.status(200).json(result);
      } catch (e) {
        console.error("Error in fetchAllCaregivers controller:", e);
        return res.status(500).json({ error: "An error occurred while fetching users" });
      }
    }

  //get Single User by their id

  async getUserById(req:Request,res:Response){
    try{
    const userId = req.params.userId;
    const result = await userService.getUserById(userId);
    if (result.error) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    }catch(e){
        console.error("Error in getUserById controller:", e);
        return res.status(500).json({ error: "An error occurred while fetching the user" });
    }
  }


  // // Update user details
  // async updateUser(req: Request, res: Response) {
  //   try {
  //     const userId = req.params.userId;
  //     const updatedData: Partial<User> = req.body;

  //     const result = await userService.updateUser(userId, updatedData);

  //     if (result.error) {
  //       return res.status(400).json(result);
  //     }

  //     return res.status(200).json(result);
  //   } catch (e) {
  //     console.error("Error in updateUser controller:", e);
  //     return res.status(500).json({ error: "An error occurred while updating the user" });
  //   }
  // }

  // Activate a user account
  async activateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      const result = await userService.activateUser(userId);

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (e) {
      console.error("Error in activateUser controller:", e);
      return res.status(500).json({ error: "Error occurred while activating user account" });
    }
  }

  // Deactivate a user account
  async deactivateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      const result = await userService.deactivateUser(userId);

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (e) {
      console.error("Error in deactivateUser controller:",e);
      return res.status(500).json({ error: "Error occurred while deactivating user account" });
    }
  }
}
