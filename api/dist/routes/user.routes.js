"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const userRouter = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Fetch all clients with pagination and filters
userRouter.get('/clients', userController.fetchAllClients.bind(userController));
// Fetch all caregivers with pagination and filters
userRouter.get('/caregivers', userController.fetchAllCaregivers.bind(userController));
// Select a specific user
userRouter.get('/users/:userId', userController.getUserById.bind(userController));
// Update a specific user
// userRouter.put('/users/:userId', userController.updateUser.bind(userController));
// Activate a specific user
userRouter.post('/users/:userId/activate', userController.activateUser.bind(userController));
// Deactivate a specific user
userRouter.post('/users/:userId/deactivate', userController.deactivateUser.bind(userController));
exports.default = userRouter;
