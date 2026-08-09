import { z } from 'zod';
import { AdminRequestStatus, ActionType } from '../../types/types.js';

const adminRequestStatusValues = Object.values(AdminRequestStatus) as [string, ...string[]];
const actionTypeValues = Object.values(ActionType) as [string, ...string[]];

export const registerAdminSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const updateAdminApprovalSchema = z.object({
  id: z.number().int().positive('Invalid parameters'),
  status: z.enum(adminRequestStatusValues, 'Invalid parameters'),
});

export const getApprovalRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  action_type: z.enum(actionTypeValues).optional(),
  search: z.string().optional(),
  status: z.enum(adminRequestStatusValues).optional(),
});