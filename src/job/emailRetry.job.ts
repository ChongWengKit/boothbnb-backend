import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { EmailLogStatus } from '@prisma/client';
import { mailService } from '../services/mail.service.js';

const RETRY_DELAYS: Record<number, number> = {
    0: 10 * 60 * 1000,
    1: 30 * 60 * 1000,
    2: 60 * 60 * 1000,
};

export async function runEmailRetry() {
    try {
        const failedLogs = await prisma.email_logs.findMany({
            where: {
                status: EmailLogStatus.FAILED,
                attempts: { lt: 3 }
            }
        });

        const now = Date.now();

        for (const log of failedLogs) {
            const delay = RETRY_DELAYS[log.attempts] ?? 60 * 60 * 1000;
            const lastAttempt = log.last_attempt_at ? log.last_attempt_at.getTime() : 0;

            if (lastAttempt > 0 && now - lastAttempt < delay) continue;

            await mailService.attemptSend(log.id);
        }
    } catch (error) {
    }
}

cron.schedule('*/10 * * * *', runEmailRetry);