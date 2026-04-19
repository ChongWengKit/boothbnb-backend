import {deleteVerifyTokenByToken, getVerifyTokenByToken} from '../services/auth.service.js';
import { verifyUser } from '../services/auth.service.js';
import { ApiResponse } from '../types/types.js';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const verify = async (req: Request, res: Response<ApiResponse<{ authentication_token: string }>>) => {
  try {
    const { token } = req.body;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined.');
    }

    if (!token) {
      throw new Error('Token is required.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const verifyToken = await getVerifyTokenByToken(hashedToken);
    if (!verifyToken) {
      throw new Error('Token not found.');
    }

    if (new Date(verifyToken.expires_in) < new Date()) {
      throw new Error('Token has expired.');
    }
    const user = await verifyUser(verifyToken.user_id);
    
    const authenticationToken = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, secret, {
          expiresIn: '30d',
        });

    await deleteVerifyTokenByToken(hashedToken);  
    
    return res.status(200).json({ success: true, message: 'Email verified successfully.', data: { authentication_token: authenticationToken } });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message});
  }
}