import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TokenDetails } from '../interfaces/user.interface';


dotenv.config();

export interface extendedRequest extends Request {
  info?: TokenDetails;
}

export async function authMiddleware(req: extendedRequest, res: Response, next: NextFunction) {
  try {
    // Check if the request is authenticated via passport session (OAuth)
    if (req.isAuthenticated()) {
      req.info = req.user as TokenDetails;
      return next();
    }

    // Extract token from cookies or Authorization header for JWT authentication
    const cookies = req.cookies || {};
    const token = cookies.token || (req.headers['authorization'] as string)?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authorization denied' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Ensure decoded has the structure of TokenDetails
    if (decoded && typeof decoded === 'object' && 'id' in decoded && 'email' in decoded) {
      req.info = decoded as TokenDetails;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Token is not valid or expired' });
  }
}
