import { EmailLogStatus } from '@prisma/client';
import { updateEmailLogStatus } from '../services/mail.service.js';
import { getEmailLogById, attemptSend, getAllEmailLogs } from '../services/mail.service.js';
export const handleResendWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        if (!data || !data.email_id) {
            return res.status(400).json({ success: false, message: 'Invalid payload: email_id is missing' });
        }
        const emailId = data.email_id;
        let newStatus = null;
        if (type === 'email.sent' || type === 'email.delivered') {
            newStatus = EmailLogStatus.SUCCESSFUL;
        }
        else if (type === 'email.bounced') {
            newStatus = EmailLogStatus.BOUNCED;
        }
        else if (type === 'email.complained') {
            newStatus = EmailLogStatus.COMPLAINED;
        }
        if (newStatus) {
            await updateEmailLogStatus(emailId, newStatus);
        }
        return res.status(200).json({ received: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const getEmailLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;
        const search = req.query.search;
        const logs = await getAllEmailLogs(page, limit, status, category, search);
        return res.status(200).json({
            success: true,
            message: 'Email logs retrieved successfully',
            data: logs.data,
            meta: logs.meta
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const resendEmail = async (req, res) => {
    try {
        const { logId } = req.body;
        if (!logId) {
            return res.status(400).json({ success: false, message: 'Invalid payload: logId is missing' });
        }
        const emailLog = await getEmailLogById(parseInt(logId));
        if (emailLog) {
            await attemptSend(emailLog.id);
        }
        return res.status(200).json({ success: true, message: 'Email resent successfully' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
//# sourceMappingURL=mail.controller.js.map