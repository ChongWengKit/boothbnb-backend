import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { UpdateAdminRequestParams } from '../types/types.js';
import { ActionType, AdminRequestStatus, Role } from '../types/types.js';
import { adminService } from '../services/admin.service.js';
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await adminService.registerAdmin(email);

    return res.status(201).json({ success: true, message: 'Admin invitation sent successfully.' });
  } catch (error: any) {
    if (error.message === 'EXISTING_USER') {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error registering admin' });
  }
};

export const updateAdminApproval = async (req: Request<UpdateAdminRequestParams>, res: Response<ApiResponse<any>>) => {
  try {
    const { id, status } = req.body;
    console.log(id,status)
    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Invalid parameters.' });
    }
    await adminService.processAdminApproval(id, status);
    return res.status(200).json({
      success: true,
      message: 'Request updated successfully.',
      data: { id, status },
    });
  } catch (error: any) {
    if (error.message === "REQUEST_NOT_FOUND") return res.status(404).json({ success: false, message: 'Request not found' });
    if (error.message === "USER_NOT_FOUND") return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(500).json({ success: false, message: 'Internal server error updating admin request' });
  }
};

export const getApprovalRequests = async (req: Request<{}>, res: Response<ApiResponse<any>>) => {
  try {
    const { page = 1, limit = 10, action_type, search, status } = req.query;
    const requests = await adminService.getAdminRequests(Number(page), Number(limit), action_type as ActionType, search as string, status as AdminRequestStatus);
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
