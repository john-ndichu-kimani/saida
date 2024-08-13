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
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Check if the request is authenticated via passport session (OAuth)
            if (req.isAuthenticated()) {
                req.info = req.user;
                return next();
            }
            // Extract token from cookies or Authorization header for JWT authentication
            const cookies = req.cookies || {};
            const token = cookies.token || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return res.status(401).json({ error: 'Authorization denied' });
            }
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            // Verify the token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Ensure decoded has the structure of TokenDetails
            if (decoded && typeof decoded === 'object' && 'id' in decoded && 'email' in decoded) {
                req.info = decoded;
                next();
            }
            else {
                return res.status(401).json({ error: 'Invalid token payload' });
            }
        }
        catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ error: 'Token is not valid or expired' });
        }
    });
}
