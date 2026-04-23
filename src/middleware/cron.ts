import { Router, Request, Response, NextFunction } from 'express';

export const authenticateCron = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};