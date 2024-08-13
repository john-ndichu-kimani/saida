
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { TokenDetails } from '../interfaces/user.interface';

export const generateTokenAndSetCookie = (res: Response, details:TokenDetails) => {
  const token = jwt.sign(details, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
