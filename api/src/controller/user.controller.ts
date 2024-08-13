import { Request, Response } from "express";
import { UserService } from "../services/user.service";
export class UserController{

    private service = new UserService();

    async fetchUsers(req:Request, res:Response){
        let result = await this.service.fetchAllUsers();
       return res.status(200).json(result);
        
    }


}