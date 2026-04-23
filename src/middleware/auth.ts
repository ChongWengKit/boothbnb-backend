import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../types/types.js';
export const checkAuthenticationToken = (req: Request, res: Response, next: NextFunction) => {
  const authenticationToken = req.header('Authorization')?.replace('bearer ', '');
  if (!authenticationToken) {

    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined.');
  }

  try {
    const decodedToken = jwt.verify(authenticationToken, secret);
    req.user = decodedToken as User;
    next();
  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
