import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { EmailLogStatus } from '@prisma/client';
import { attemptSend } from '../services/mail.service.js';

export async function runEmailRetry() {
    console.log('[Cron Job] Retrying failed API email requests...');
    try {
        const failedLogs = await prisma.email_logs.findMany({
            where: {
                status: EmailLogStatus.FAILED,
                attempts: { lt: 3 }
            }
        });

        for (const log of failedLogs) {
            console.log(`[Cron] Retrying email log ID: ${log.id} (Attempt ${log.attempts + 1})`);
            await attemptSend(log.id);
        }
    } catch (error) {
        console.error('[Cron Job] Error in email retry job:', (error as Error).message);
    }
}

cron.schedule('*/5 * * * *', runEmailRetry);