"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().min(2).required().messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 2 characters long',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password_hash: joi_1.default.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).required().messages({
        'string.empty': 'Password is required',
        'string.pattern.base': 'Password must be at least 8 characters long and contain letters and numbers',
    }),
    first_name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
    }),
    last_name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
    }),
    phone_number: joi_1.default.string().regex(/^[0-9]{10}$/).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must be exactly 10 digits',
    }),
    profile_picture_url: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Profile picture URL must be a valid URI',
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password_hash: joi_1.default.string().required().messages({
        'string.empty': 'Password is required',
    }),
});
