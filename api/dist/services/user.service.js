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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_interface_1 = require("../interfaces/user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
class UserService {
    fetchAllUsers() {
        return __awaiter(this, arguments, void 0, function* (page = 1, pageSize = 10, filter = {}) {
            try {
                if (page < 1 || pageSize < 1) {
                    return { error: "Invalid pagination parameters" };
                }
                const skip = (page - 1) * pageSize;
                const users = yield init_prisma_util_1.default.user.findMany({
                    where: Object.assign({ role: user_interface_1.Role.CLIENT }, filter),
                    skip: skip,
                    take: pageSize,
                    orderBy: { createdAt: 'desc' },
                });
                const totalUsers = yield init_prisma_util_1.default.user.count({
                    where: Object.assign({ role: user_interface_1.Role.CLIENT }, filter),
                });
                return {
                    users,
                    totalPages: Math.ceil(totalUsers / pageSize),
                    currentPage: page,
                    totalUsers,
                };
            }
            catch (e) {
                console.error("Error fetching users:", e.message);
                return { error: "An error occurred while fetching users" };
            }
        });
    }
    updateUser(userId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (updatedData.password) {
                    updatedData.password = bcryptjs_1.default.hashSync(updatedData.password, 10);
                }
                const updatedUser = yield init_prisma_util_1.default.user.update({
                    where: { id: userId },
                    data: Object.assign(Object.assign({}, updatedData), { updatedAt: new Date() }),
                });
                return {
                    message: "User updated successfully",
                    updatedUser,
                };
            }
            catch (e) {
                console.error("Error updating user:", e.message);
                return { error: "An error occurred while updating the user" };
            }
        });
    }
    activateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.update({
                    where: { id: userId },
                    data: { status: user_interface_1.Status.ACTIVE },
                });
                return { message: "User account activated successfully", user };
            }
            catch (e) {
                console.error("Error activating user:", e.message);
                return { error: "Error occurred while activating user account" };
            }
        });
    }
    deactivateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.update({
                    where: { id: userId },
                    data: { status: user_interface_1.Status.INACTIVE },
                });
                return { message: "User account deactivated successfully", user };
            }
            catch (e) {
                console.error("Error deactivating user:", e.message);
                return { error: "Error occurred while deactivating user account" };
            }
        });
    }
}
exports.UserService = UserService;
