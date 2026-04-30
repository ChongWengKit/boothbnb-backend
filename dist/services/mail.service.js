import { Resend } from 'resend';
import { VerifyEmail } from '../emails/verify.js';
import { ResetPasswordEmail } from '../emails/reset-pass.js';
import { BookingConfirmedEmail } from '../emails/booking-confirmed.js';
import { HostApproved } from '../emails/host-approved.js';
import { AdminInviteEmail } from '../emails/admin-Invite.js';
import { VendorPaidNotificationEmail } from '../emails/vendor-paid.js';
import { EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { prisma } from '../lib/db.js';
import crypto from 'crypto';
import { createAdminToken, deleteAdminTokensByEmail } from './auth.service.js';
const resend = new Resend(process.env.RESEND_API_KEY);
export const attemptSend = async (logId) => {
    const log = await prisma.email_logs.findUnique({ where: { id: logId } });
    if (!log)
        return null;
    const status = log.status;
    if (status === "BOUNCED" || status === "COMPLAINED") {
        return null;
    }
    const payload = log.payload;
    let emailOptions = null;
    const currentAttempts = log.attempts + 1;
    try {
        switch (log.category) {
            case EmailLogCategory.VERIFICATION: {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
                await prisma.verify_tokens.deleteMany({ where: { user_id: log.user_id } });
                await prisma.verify_tokens.create({
                    data: {
                        token: hashedToken,
                        user_id: log.user_id,
                        expires_in: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                    },
                });
                emailOptions = {
                    to: [payload.email],
                    subject: 'Verify your account',
                    react: VerifyEmail({ username: payload.name, token: rawToken }),
                };
                break;
            }
            case EmailLogCategory.PASSWORD_RESET: {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
                await prisma.reset_tokens.deleteMany({ where: { user_id: log.user_id } });
                await prisma.reset_tokens.create({
                    data: {
                        token: hashedToken,
                        user_id: log.user_id,
                        expires_in: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                    },
                });
                emailOptions = {
                    to: [payload.email],
                    subject: 'Reset your password',
                    react: ResetPasswordEmail({ username: payload.name, token: rawToken }),
                };
                break;
            }
            case EmailLogCategory.ADMIN_INVITATION: {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
                await deleteAdminTokensByEmail(payload.email);
                await createAdminToken(payload.email, hashedToken, new Date(Date.now() + 1000 * 60 * 60 * 24));
                emailOptions = {
                    to: [payload.email],
                    subject: 'Invitation to Admin Team',
                    react: AdminInviteEmail({ email: payload.email, token: rawToken }),
                };
                break;
            }
            case EmailLogCategory.BOOKING_CONFIRMATION:
                emailOptions = {
                    to: [payload.email],
                    subject: 'Booking Confirmed',
                    react: BookingConfirmedEmail({ username: payload.name, event: payload.event, booth: payload.booth, bookingId: payload.bookingId }),
                };
                break;
            case EmailLogCategory.HOST_APPROVED:
                emailOptions = {
                    to: [payload.email],
                    subject: 'Host Approved',
                    react: HostApproved({ username: payload.name }),
                };
                break;
            case EmailLogCategory.VENDOR_PAID_NOTIFICATION:
                emailOptions = {
                    to: [payload.hostEmail],
                    subject: 'Payment Received for Booth Booking',
                    react: VendorPaidNotificationEmail({ hostName: payload.hostName, vendorName: payload.vendorName, eventName: payload.eventName, boothName: payload.boothName, vendorEmail: payload.vendorEmail }),
                };
                break;
            default:
                return null;
        }
        if (!emailOptions)
            return null;
        const { data, error } = await resend.emails.send({
            from: `Boothbnb <${process.env.EMAIL}>`,
            ...emailOptions,
            headers: {
                'X-Idempotency-Key': `emaillog_${log.id}`,
            },
        });
        if (error)
            throw error;
        return await prisma.email_logs.update({
            where: { id: log.id },
            data: {
                status: EmailLogStatus.PENDING,
                email_id: data?.id,
                attempts: currentAttempts,
            },
        });
    }
    catch (e) {
        return await prisma.email_logs.update({
            where: { id: log.id },
            data: {
                status: EmailLogStatus.FAILED,
                attempts: currentAttempts
            },
        });
    }
};
export const sendVerifyEmail = async (email, name, user_id) => {
    const log = await logEmail(user_id, EmailLogCategory.VERIFICATION, { email, name });
    return attemptSend(log.id);
};
export const sendAdminInviteMail = async (email, name, user_id) => {
    const log = await logEmail(user_id, EmailLogCategory.ADMIN_INVITATION, { email, name });
    return attemptSend(log.id);
};
export const sendResetPasswordMail = async (email, name, user_id) => {
    const log = await logEmail(user_id, EmailLogCategory.PASSWORD_RESET, { email, name });
    return attemptSend(log.id);
};
export const sendBookingConfirmedMail = async (email, name, event, booth, bookingId, user_id) => {
    const log = await logEmail(user_id, EmailLogCategory.BOOKING_CONFIRMATION, { email, name, event, booth, bookingId });
    return attemptSend(log.id);
};
export const sendHostApproveMail = async (user_id, name, email) => {
    const log = await logEmail(user_id, EmailLogCategory.HOST_APPROVED, { name, email });
    return attemptSend(log.id);
};
export const sendVendorPaidMail = async (user_id, hostName, hostEmail, vendorName, vendorEmail, eventName, boothName) => {
    const log = await logEmail(user_id, EmailLogCategory.VENDOR_PAID_NOTIFICATION, { hostName, vendorName, hostEmail, vendorEmail, eventName, boothName });
    return attemptSend(log.id);
};
export const logEmail = async (user_id, category, payload, status = EmailLogStatus.PENDING, email_id) => {
    return prisma.email_logs.create({
        data: {
            user_id,
            category,
            payload,
            status,
            email_id: email_id ?? null,
        },
    });
};
export const updateEmailLogStatus = async (emailId, newStatus) => {
    await prisma.email_logs.updateMany({
        where: { email_id: emailId },
        data: { status: newStatus }
    });
};
export const syncEmailStatus = async (emailId) => {
    try {
        const { data, error } = await resend.emails.get(emailId);
        if (error || !data) {
            return;
        }
        let newStatus = null;
        if (data.last_event === 'sent' || data.last_event === 'delivered') {
            newStatus = EmailLogStatus.SUCCESSFUL;
        }
        else if (data.last_event === 'bounced') {
            newStatus = EmailLogStatus.BOUNCED;
        }
        else if (data.last_event === 'complained') {
            newStatus = EmailLogStatus.COMPLAINED;
        }
        if (newStatus) {
            await updateEmailLogStatus(emailId, newStatus);
        }
    }
    catch (e) {
    }
};
export const getEmailLogById = async (id) => {
    return prisma.email_logs.findUnique({
        where: { id },
        select: {
            id: true,
            user_id: true,
            category: true,
            payload: true,
            status: true,
            email_id: true,
            attempts: true
        },
    });
};
export const getAllEmailLogs = async (page, limit, status, category, search) => {
    const result = await prisma.email_logs.findMany({
        where: {
            ...(status && { status: status }),
            ...(category && { category: category }),
        },
        orderBy: {
            id: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true,
            user_id: true,
            category: true,
            payload: true,
            status: true,
            email_id: true,
            attempts: true,
        }
    });
    const count = await prisma.email_logs.count();
    const totalItems = count;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page / limit + 1;
    const itemsPerPage = limit;
    return {
        data: result,
        meta: {
            totalItems,
            totalPages,
            currentPage,
            itemsPerPage,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        }
    };
};
//# sourceMappingURL=mail.service.js.map