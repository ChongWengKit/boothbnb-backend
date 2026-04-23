import { updateAdminRequest } from '../services/admin.service.js';
import { ActionType, AdminRequestStatus, Role } from '../types/types.js';
import { findUserById, verifyUser, findUserByEmail, createUser } from '../services/auth.service.js';
import { sendAdminInviteMail } from '../services/mail.service.js';
import { getAdminRequests } from '../services/admin.service.js';
import { sendHostApproveMail } from '../services/mail.service.js';
export const registerAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
        const user = await createUser({
            email,
            username,
            role: Role.ADMIN,
            is_verified: false,
        });
        await sendAdminInviteMail(email, username, user.id);
        return res.status(201).json({ success: true, message: 'Admin invitation sent successfully.' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error registering admin' });
    }
};
export const updateAdminApproval = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ success: false, message: 'Invalid parameters.' });
        }
        const result = await updateAdminRequest(id, status);
        if (result.action_type === ActionType.HOST_APPROVAL) {
            if (status === AdminRequestStatus.APPROVED) {
                const user = await findUserById(result.user_id);
                if (!user) {
                    return res.status(404).json({ success: false, message: `User with id ${result.user_id} does not exist` });
                }
                await verifyUser(result.user_id);
                await sendHostApproveMail(user.id, user.username, user.email);
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Request updated successfully.',
            data: { id, status },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error updating admin request' });
    }
};
export const getApprovalRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, action_type, search, status } = req.query;
        const requests = await getAdminRequests(Number(page), Number(limit), action_type, search, status);
        return res.status(200).json({
            success: true,
            message: 'Approval requests retrieved successfully.',
            data: requests.data,
            meta: requests.meta,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error retrieving approval requests' });
    }
};
//# sourceMappingURL=admin.controller.js.map