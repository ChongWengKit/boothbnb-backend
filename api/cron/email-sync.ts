import { VercelRequest, VercelResponse } from '@vercel/node';
import { runEmailSync } from '../../src/job/email-sync.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await runEmailSync();
    return res.json({ ok: true });
}
