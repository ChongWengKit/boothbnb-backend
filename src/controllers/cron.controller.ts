import { Request, Response } from 'express';
import { runBookingCleanup} from '../job/bookingCleanUp.job.js';
import { runEmailRetry } from '../job/emailRetry.job.js';
import { runEmailSync } from '../job/emailSync.job.js';
import { runCurrencyUpdate } from '../job/currencyRate.job.js';
export async function bookingCleanupHandler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await runBookingCleanup();
        return res.json({ ok: true, message: 'Booking cleanup completed' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function emailRetryHandler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await runEmailRetry();
        return res.json({ ok: true, message: 'Email retry completed' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function currencyUpdateHandler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await runCurrencyUpdate();
        return res.json({ ok: true, message: 'Currency update completed' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function emailSyncHandler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await runEmailSync();
        return res.json({ ok: true, message: 'Email sync completed' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
