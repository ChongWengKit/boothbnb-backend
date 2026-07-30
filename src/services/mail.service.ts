import { Resend } from 'resend';
import { VerifyEmail } from '../emails/verify.template.js';
import { ResetPasswordEmail } from '../emails/resetPass.template.js';
import { BookingConfirmedEmail } from '../emails/bookingConfirmed.template.js';
import { HostApproved } from '../emails/hostApproved.template.js';
import { AdminInviteEmail } from '../emails/adminInvite.template.js';
import { VendorPaidNotificationEmail } from '../emails/vendorPaid.template.js';
import pkg, { EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { JSX } from 'react';
import crypto from 'crypto';
import { mailRepository } from '../repository/mail.repository.js';
import { authRepository } from '../repository/auth.repository.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const attemptSend = async (logId: number) => {
  const log = await prisma.email_logs.findUnique({ where: { id: logId } });

  if (!log) return null;

  const status = log.status;

  if (status === "BOUNCED" || status === "COMPLAINED") {
    return null;
  }

  const payload = log.payload as any;
  let emailOptions: { to: string[]; subject: string; react: JSX.Element } | null = null;
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

        await authRepository.deleteAdminTokensByEmail(payload.email);
        await authRepository.createAdminToken(payload.email, hashedToken, new Date(Date.now() + 1000 * 60 * 60 * 24));

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
          to: [payload.email],
          subject: 'Payment Received for Booth Booking',
          react: VendorPaidNotificationEmail({ hostName: payload.name, vendorName: payload.vendorName, eventName: payload.eventName, boothName: payload.boothName, vendorEmail: payload.vendorEmail }),
        };
        break;
      default:
        return null;
    }

    if (!emailOptions) return null;

    const { data, error } = await resend.emails.send({
      from: `Boothbnb <${process.env.EMAIL}>`,
      ...emailOptions,
      headers: {
        'X-Idempotency-Key': `emaillog_${log.id}`,
      },
    });

    if (error) throw error;

    return await prisma.email_logs.update({
      where: { id: log.id },
      data: {
        status: EmailLogStatus.PENDING,
        email_id: data?.id,
        attempts: currentAttempts,
      },
    });
  } catch (e: any) {

    await prisma.email_logs.update({
      where: { id: log.id },
      data: {
        status: EmailLogStatus.FAILED,
        attempts: currentAttempts
      },
    });
  }
};

const syncEmailStatus = async (emailId: string) => {
  try {
    const { data, error } = await resend.emails.get(emailId);
    if (error || !data) {
      return;
    }
    let newStatus: EmailLogStatus | null = null;
    if (data.last_event === 'sent' || data.last_event === 'delivered') {
      newStatus = EmailLogStatus.SUCCESSFUL;
    } else if (data.last_event === 'bounced') {
      newStatus = EmailLogStatus.BOUNCED;
    } else if (data.last_event === 'complained') {
      newStatus = EmailLogStatus.COMPLAINED;
    }

    if (newStatus) {
      await mailRepository.updateEmailLogStatus(emailId, newStatus);
    }
  } catch (e: any) {
  }
};

const handleResendWebhook = async (type: string, emailId: string, newStatus?: EmailLogStatus | null) => {
  if (type === 'email.sent' || type === 'email.delivered') {
    newStatus = EmailLogStatus.SUCCESSFUL;
  } else if (type === 'email.bounced') {
    newStatus = EmailLogStatus.BOUNCED;
  } else if (type === 'email.complained') {
    newStatus = EmailLogStatus.COMPLAINED;
  }

  if (newStatus) {
    await mailRepository.updateEmailLogStatus(emailId, newStatus);
  }
}

const resentEmail = async (logId: string) => {
  const emailLog = await mailRepository.getEmailLogById(parseInt(logId));

  if (emailLog) {
    if (emailLog.status === EmailLogStatus.PENDING) {
      throw new Error('PENDING_EMAIL')
    }
    if (emailLog.status === EmailLogStatus.BOUNCED || emailLog.status === EmailLogStatus.COMPLAINED) {
      throw new Error('INVALID_EMAIL')
    }
    await attemptSend(emailLog.id);
  }

};
export const mailService = { attemptSend, syncEmailStatus, handleResendWebhook, resentEmail };
