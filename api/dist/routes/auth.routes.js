"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const passport_1 = __importDefault(require("passport"));
const verifyToken_1 = require("../middlewares/verifyToken");
const authRouter = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Registration Route
authRouter.post('/register', (req, res) => authController.registerUser(req, res));
// Email Verification Route
authRouter.get('/verify-email/:code', (req, res) => authController.verifyEmail(req, res));
// Login Route
authRouter.post('/login', (req, res) => authController.login(req, res));
// Logout Route (Protected)
authRouter.post('/logout', verifyToken_1.authMiddleware, (req, res) => authController.logoutUser(req, res));
// Forgot Password Route
authRouter.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
// Reset Password Route
authRouter.post('/reset-password/:token', (req, res) => authController.resetPassword(req, res));
// Check Authentication Route (Protected)
authRouter.get('/check-auth', verifyToken_1.authMiddleware, (req, res) => authController.checkAuth(req, res));
// Google OAuth2 Routes
authRouter.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
}));
authRouter.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/auth/failure' }), (req, res) => {
    res.redirect('/api/v1/auth/profile');
});
// Profile Route (Protected)
authRouter.get('/profile', verifyToken_1.authMiddleware, (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            user: req.user, // Profile info should be available in req.user
        });
    }
    else {
        res.redirect('/api/v1/auth/google');
    }
});
// Route to handle failed authentication
authRouter.get('/failure', (req, res) => {
    res.send('Authentication failed. Please try again.');
});
// Facebook OAuth2 Routes
authRouter.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
authRouter.get('/facebook/callback', passport_1.default.authenticate('facebook', { failureRedirect: '/auth/failure' }), (req, res) => {
    res.redirect('/api/v1/auth/profile');
});
// Session Route (for debugging purposes)
authRouter.get('/session', (req, res) => {
    res.json({
        session: req.session,
        user: req.user
    });
});
exports.default = authRouter;
