export const authenticateCron = (req, res, next) => {
    const authHeader = req.headers?.['authorization'] || '';
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
//# sourceMappingURL=cron.js.map