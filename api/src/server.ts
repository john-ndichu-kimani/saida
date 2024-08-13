import express, { NextFunction, Request, Response, json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './strategies/google.strategy'; 
import './strategies/facebook.strategy'; 
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

// Middleware setup
app.use(json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Update to restrict origins if needed
  credentials: true,
}));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are secure in production
    maxAge: 3600000, // 1 hour
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use the authentication routes
app.use('/api/v1/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err); // Log error details to console
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}, // Show error details in development
  });
});

const port = process.env.SERVER_PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
