import { EmailLogCategory } from '@prisma/client';
import { adminRepository } from '../repository/admin.repository.js';
import { mailService } from './mail.service.js';
import { Role } from '../types/types.js';
import crypto from 'crypto';
import { authRepository } from '../repository/auth.repository.js';
import { AdminRequestStatus, ActionType } from '../types/types.js';
import { accountService } from './account.service.js';
const registerAdmin = async (email: string) => {
    const existingUser = await accountService.getUserByEmail(email);
    if (existingUser) throw new Error("EXISTING_USER");
    const username = (email as any).split('@')[0] + Math.floor(Math.random() * 1000); const password = crypto.randomBytes(16).toString('hex');

    const { user, log } = await adminRepository.createUserAndLogEmail(
        {
            email,
            username,
            role: Role.ADMIN,
            password: crypto.randomBytes(16).toString('hex'),
        },
        EmailLogCategory.ADMIN_INVITATION,
        { email, username }
    );

    await mailService.attemptSend(log.id);
    return user;
}

const findAdminRequestById = async (id: number) => {
    return await adminRepository.findAdminRequestById(id);
}

const processAdminApproval = async (id: number, status: AdminRequestStatus) => {
    const request = await adminRepository.findAdminRequestById(id);
    if (!request) throw new Error("REQUEST_NOT_FOUND");

    if (request.action_type === ActionType.HOST_APPROVAL) {
        const user = await authRepository.findUserById(request.user_id);
        if (!user) throw new Error("USER_NOT_FOUND");
        const { log } = await adminRepository.approveAdminRequestAndVerifyUser(
            id,
            request.user_id,
            status,
            EmailLogCategory.HOST_APPROVED,
            { username: user.username, email: user.email }
        );
        if (log) {
            await mailService.attemptSend(log.id);
        }
    }

    return { id, status };
}

const getAdminRequests = async (page: number, limit: number, action_type: ActionType, search: string, status: AdminRequestStatus) => {
    return await adminRepository.getAdminRequests(page, limit, action_type, search, status);
};
export const adminService = {
    registerAdmin,
    findAdminRequestById,
    processAdminApproval,
    getAdminRequests
}