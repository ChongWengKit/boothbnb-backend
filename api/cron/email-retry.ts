import { VercelRequest, VercelResponse } from '@vercel/node';
import { runEmailRetry } from '../../src/job/email-retry.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await runEmailRetry();
    return res.json({ ok: true });
}
