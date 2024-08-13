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
exports.AuthService = void 0;
// services/authService.ts
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_interface_1 = require("../interfaces/user.interface");
const mail_service_1 = __importDefault(require("./mail.service"));
const generateToken_1 = require("../utils/generateToken");
class AuthService {
    registerUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if email already exists
                const existingUserWithEmail = yield init_prisma_util_1.default.user.findUnique({
                    where: { email: user.email },
                });
                if (existingUserWithEmail) {
                    return { success: false, message: 'User already exists' };
                }
                // Generate ID, hash password and verificationToken
                const user_id = (0, uuid_1.v4)();
                const hashed_password = bcryptjs_1.default.hashSync(user.password, 10);
                const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
                const newUser = yield init_prisma_util_1.default.user.create({
                    data: {
                        id: user_id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        email: user.email,
                        password: hashed_password,
                        role: user_interface_1.Role.CLIENT,
                        profileImage: user.profileImage,
                        isVerified: false,
                        status: user_interface_1.Status.ACTIVE,
                        verificationToken,
                        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                // Send verification email
                yield (0, mail_service_1.default)({
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
                    user: Object.assign(Object.assign({}, newUser), { password: undefined }),
                    verificationToken,
                };
            }
            catch (e) {
                console.error('Error registering user:', e);
                return { error: 'An error occurred while creating the user' };
            }
        });
    }
    verifyEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.findFirst({
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
                const updatedUser = yield init_prisma_util_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        isVerified: true,
                        verificationToken: null,
                        verificationTokenExpiresAt: null,
                    },
                });
                // Send welcome email
                yield (0, mail_service_1.default)({
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
                    user: Object.assign(Object.assign({}, updatedUser), { password: undefined }),
                };
            }
            catch (error) {
                console.error('Error verifying email:', error);
                return { error: 'An error occurred while verifying the email' };
            }
        });
    }
    loginUser(res, logins) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.findUnique({
                    where: {
                        email: logins.email,
                    },
                });
                if (!user) {
                    return { success: false, message: 'Invalid credentials' };
                }
                if (!user.isVerified) {
                    return { success: false, message: 'Your account is unverified!' };
                }
                // Compare password
                const isPasswordValid = bcryptjs_1.default.compareSync(logins.password, user.password);
                if (!isPasswordValid) {
                    return { success: false, message: 'Invalid credentials' };
                }
                const token = (0, generateToken_1.generateTokenAndSetCookie)(res, {
                    id: user.id,
                    email: user.email,
                });
                const updatedUser = yield init_prisma_util_1.default.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() },
                });
                return {
                    success: true,
                    message: 'Logged in successfully',
                    token,
                };
            }
            catch (error) {
                console.error('Error during login:', error);
                return { error: 'Internal server error' };
            }
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            return { success: true, message: 'Logged out successfully' };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.findUnique({ where: { email } });
                if (!user) {
                    return { success: false, message: 'User not found' };
                }
                const resetToken = crypto_1.default.randomBytes(20).toString("hex");
                const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
                yield init_prisma_util_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        resetPasswordToken: resetToken,
                        resetPasswordExpiresAt: resetTokenExpiresAt,
                    },
                });
                const resetUrl = `${process.env.FRONTEND_URL}/${resetToken}`;
                // Send reset password email
                yield (0, mail_service_1.default)({
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
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                return { error: 'An error occurred while sending the password reset email' };
            }
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.findFirst({
                    where: {
                        resetPasswordToken: token,
                        resetPasswordExpiresAt: { gt: new Date() },
                    },
                });
                if (!user) {
                    return { success: false, message: 'Invalid or expired reset token' };
                }
                const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
                yield init_prisma_util_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        password: hashedPassword,
                        resetPasswordToken: null,
                        resetPasswordExpiresAt: null,
                    },
                });
                // Send reset success email
                yield (0, mail_service_1.default)({
                    to: user.email,
                    subject: 'Password Reset Successful',
                    template: 'resetSuccess',
                    context: {
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                    },
                });
                return { success: true, message: 'Password reset successful' };
            }
            catch (error) {
                console.error('Error resetting password:', error);
                return { error: 'An error occurred while resetting the password' };
            }
        });
    }
    checkAuth(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield init_prisma_util_1.default.user.findUnique({
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
            }
            catch (error) {
                console.log('Error in checkAuth', error);
                return { success: false, message: 'Internal server error' };
            }
        });
    }
}
exports.AuthService = AuthService;
