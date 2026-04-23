import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { EmailLogStatus } from '@prisma/client';
import { syncEmailStatus } from '../services/mail.service.js';

export async function runEmailSync() {
    try {
        const pendingLogs = await prisma.email_logs.findMany({
            where: {
                status: EmailLogStatus.PENDING,
                email_id: { not: null }
            }
        });

        for (const log of pendingLogs) {
            await syncEmailStatus(log.email_id!);
        }
    } catch (error) {
    }
}

cron.schedule('*/5 * * * *', runEmailSync);