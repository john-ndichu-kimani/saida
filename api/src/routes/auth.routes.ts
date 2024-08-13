import { Router, Request, Response } from 'express';
import { AuthController } from '../controller/auth.controller';
import passport from 'passport';
import { authMiddleware, extendedRequest } from '../middlewares/verifyToken';

const authRouter = Router();
const authController = new AuthController();

// Registration Route
authRouter.post('/register', (req: Request, res: Response) => authController.registerUser(req, res));

// Email Verification Route
authRouter.get('/verify-email/:code', (req: Request, res: Response) => authController.verifyEmail(req, res));

// Login Route
authRouter.post('/login', (req: Request, res: Response) => authController.login(req, res));

// Logout Route (Protected)
authRouter.post('/logout', authMiddleware, (req: extendedRequest, res: Response) => authController.logoutUser(req, res));

// Forgot Password Route
authRouter.post('/forgot-password', (req: Request, res: Response) => authController.forgotPassword(req, res));

// Reset Password Route
authRouter.post('/reset-password/:token', (req: Request, res: Response) => authController.resetPassword(req, res));

// Check Authentication Route (Protected)
authRouter.get('/check-auth', authMiddleware, (req: extendedRequest, res: Response) => authController.checkAuth(req, res));

// Google OAuth2 Routes
authRouter.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req: Request, res: Response) => {
    res.redirect('/api/v1/auth/profile'); 
  }
);

// Profile Route (Protected)
authRouter.get('/profile', authMiddleware, (req: extendedRequest, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({
      user: req.user, // Profile info should be available in req.user
    });
  } else {
    res.redirect('/api/v1/auth/google');
  }
});

// Route to handle failed authentication
authRouter.get('/failure', (req: Request, res: Response) => {
  res.send('Authentication failed. Please try again.');
});


// Facebook OAuth2 Routes
authRouter.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

authRouter.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/failure' }),
  (req: Request, res: Response) => {
    res.redirect('/api/v1/auth/profile'); 
  }
);

// Session Route (for debugging purposes)
authRouter.get('/session', (req: Request, res: Response) => {
  res.json({
    session: req.session,
    user: req.user
  });
});

export default authRouter;
