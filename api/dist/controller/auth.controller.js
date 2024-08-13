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
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    constructor() {
        this.service = new auth_service_1.AuthService();
    }
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.registerUser(req.body);
                if (!result.success) {
                    return res.status(400).json(result);
                }
                res.status(201).json(result);
            }
            catch (error) {
                console.error("Error in registerUser:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.verifyEmail(req.params.code);
                if (!result.success) {
                    return res.status(400).json(result);
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in verifyEmail:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.loginUser(res, req.body);
                if (!result.success) {
                    return res.status(400).json(result);
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in login:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    logoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("token");
                const result = yield this.service.logout();
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in logoutUser:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.service.forgotPassword(req.body.email);
                if (!result.success) {
                    return res.status(400).json(result);
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in forgotPassword:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                const { password } = req.body;
                const result = yield this.service.resetPassword(token, password);
                if (!result.success) {
                    return res.status(400).json(result);
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in resetPassword:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    checkAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.info) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(400).json({ success: false, message: "User ID is required" });
                }
                const result = yield this.service.checkAuth(userId);
                if (!result.success) {
                    return res.status(404).json(result);
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error in checkAuth:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.AuthController = AuthController;
