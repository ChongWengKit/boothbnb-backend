import cron from 'node-cron';
import { prisma } from '../lib/db.js';
import { EmailLogStatus } from '@prisma/client';
import { attemptSend } from '../services/mail.service.js';
export async function runEmailRetry() {
    try {
        const failedLogs = await prisma.email_logs.findMany({
            where: {
                status: EmailLogStatus.FAILED,
                attempts: { lt: 3 }
            }
        });
        for (const log of failedLogs) {
            await attemptSend(log.id);
        }
    }
    catch (error) {
    }
}
cron.schedule('*/5 * * * *', runEmailRetry);
//# sourceMappingURL=email-retry.js.map