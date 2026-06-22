
import { ApiResponse } from '../types/types.js';
import type { Request, Response } from 'express';

import { accountService } from '../services/account.service.js';

export const verify = async (req: Request, res: Response<ApiResponse<{ authentication_token: string }>>) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const result = await accountService.verifyAccount(token);
    const user = result.user;
    const authenticationToken = result.authenticationToken;
    
    return res.status(200).json({ success: true, message: 'Email verified successfully.', data: { authentication_token: authenticationToken } });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message});
  }
}