"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
class UserController {
    // Fetch all users with pagination and optional filters
    fetchAllClients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
                const result = yield userService.fetchAllClients(page, pageSize, filter);
                if (result.error) {
                    return res.status(400).json(result);
                }
                return res.status(200).json(result);
            }
            catch (e) {
                console.error("Error in fetchAllClients controller:", e);
                return res.status(500).json({ error: "An error occurred while fetching users" });
            }
        });
    }
    // Fetch all users with pagination and optional filters
    fetchAllCaregivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
                const result = yield userService.fetchAllCaregivers(page, pageSize, filter);
                if (result.error) {
                    return res.status(400).json(result);
                }
                return res.status(200).json(result);
            }
            catch (e) {
                console.error("Error in fetchAllCaregivers controller:", e);
                return res.status(500).json({ error: "An error occurred while fetching users" });
            }
        });
    }
    //get Single User by their id
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const result = yield userService.getUserById(userId);
                if (result.error) {
                    return res.status(400).json(result);
                }
                return res.status(200).json(result);
            }
            catch (e) {
                console.error("Error in getUserById controller:", e);
                return res.status(500).json({ error: "An error occurred while fetching the user" });
            }
        });
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
    activateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const result = yield userService.activateUser(userId);
                if (result.error) {
                    return res.status(400).json(result);
                }
                return res.status(200).json(result);
            }
            catch (e) {
                console.error("Error in activateUser controller:", e);
                return res.status(500).json({ error: "Error occurred while activating user account" });
            }
        });
    }
    // Deactivate a user account
    deactivateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const result = yield userService.deactivateUser(userId);
                if (result.error) {
                    return res.status(400).json(result);
                }
                return res.status(200).json(result);
            }
            catch (e) {
                console.error("Error in deactivateUser controller:", e);
                return res.status(500).json({ error: "Error occurred while deactivating user account" });
            }
        });
    }
}
exports.UserController = UserController;
