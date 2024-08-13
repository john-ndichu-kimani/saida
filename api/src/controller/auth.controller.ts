import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { extendedRequest } from "../middlewares/verifyToken";

export class AuthController {
  private service = new AuthService();

  async registerUser(req: Request, res: Response) {
    try {
      const result = await this.service.registerUser(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error in registerUser:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const result = await this.service.verifyEmail(req.params.code);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in verifyEmail:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.service.loginUser(res, req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      res.clearCookie("token");
      const result = await this.service.logout();

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in logoutUser:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await this.service.forgotPassword(req.body.email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
        const { token } = req.params ;
		    const { password } = req.body;
      
      const result = await this.service.resetPassword(token,password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async checkAuth(req: extendedRequest, res: Response) {
    try {
      const userId = req.info?.id;

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const result = await this.service.checkAuth(userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error in checkAuth:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
