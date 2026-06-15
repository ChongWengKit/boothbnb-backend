import { Request, Response } from 'express';
import crypto from 'crypto';
import { ApiResponse } from '../types/types.js';
import { EmailLogCategory } from '@prisma/client';
import { approveAdminRequestAndVerifyUser, createUserAndLogEmail, findAdminRequestById, updateAdminRequest } from '../services/admin.service.js';
import { UpdateAdminRequestParams } from '../types/types.js';
import { ActionType, AdminRequestStatus, Role } from '../types/types.js';
import { findUserById, verifyUser, createUser } from '../services/auth.service.js';
import { findUserByEmail } from '../services/auth.service.js';
import { attemptSend } from '../services/mail.service.js';
import { getAdminRequests } from '../services/admin.service.js';
import validator from 'validator';
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000)
    const { user, log } = await createUserAndLogEmail(
      {
        email,
        username,
        role: Role.ADMIN,
        password: crypto.randomBytes(16).toString('hex'),
      },
      EmailLogCategory.ADMIN_INVITATION,
      { email, username }
    );

    await attemptSend(log.id);

    return res.status(201).json({ success: true, message: 'Admin invitation sent successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error registering admin' });
  }
};

export const updateAdminApproval = async (req: Request<UpdateAdminRequestParams>, res: Response<ApiResponse<any>>) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Invalid parameters.' });
    }
    const result = await findAdminRequestById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: `Admin request with id ${id} does not exist` });
    }
    if (result.action_type === ActionType.HOST_APPROVAL) {

      if (status === AdminRequestStatus.APPROVED) {
        const user = await findUserById(result.user_id);
        if (!user) {
          return res.status(404).json({ success: false, message: `User with id ${result.user_id} does not exist` });
        }
        const { log} = await approveAdminRequestAndVerifyUser(id, result.user_id, status, EmailLogCategory.HOST_APPROVED, {
          username: user.username,
          email: user.email,
        });
        await attemptSend(log.id);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Request updated successfully.',
      data: { id, status },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error updating admin request' });
  }
};

export const getApprovalRequests = async (req: Request<{}>, res: Response<ApiResponse<any>>) => {
  try {
    const { page = 1, limit = 10, action_type, search, status } = req.query;
    const requests = await getAdminRequests(Number(page), Number(limit), action_type as ActionType, search as string, status as AdminRequestStatus);
    return res.status(200).json({
      success: true,
      message: 'Approval requests retrieved successfully.',
      data: requests.data,
      meta: requests.meta,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error retrieving approval requests' });
  }
};
