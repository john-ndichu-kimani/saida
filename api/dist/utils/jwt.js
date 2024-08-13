"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn });
};
exports.generateToken = generateToken;
// Function to verify a JWT token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
