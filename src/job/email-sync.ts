import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { EmailLogStatus } from '@prisma/client';
import { syncEmailStatus } from '../services/mail.service.js';

export async function runEmailSync() {
    console.log('[Cron Job] Syncing pending email statuses from Resend...');
    try {
        const pendingLogs = await prisma.email_logs.findMany({
            where: {
                status: EmailLogStatus.PENDING,
                email_id: { not: null }
            }
        });

        for (const log of pendingLogs) {
            console.log(`[Cron] Checking status for email log ID: ${log.id} (Resend ID: ${log.email_id})`);
            await syncEmailStatus(log.email_id!);
        }
    } catch (error) {
        console.error('[Cron Job] Error in email status sync job:', (error as Error).message);
    }
}

cron.schedule('*/5 * * * *', runEmailSync);