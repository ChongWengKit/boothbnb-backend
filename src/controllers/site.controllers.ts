import { Request, Response } from 'express';
import { siteRepository } from '../repository/site.repository.js';
export const getAllEventSlug = async (req: Request, res: Response) => {
    try {
        const events = await siteRepository.getAllEventSlugs();
        return res.status(200).json({ status: 'success', data: events });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Failed to fetch event slugs' });
    }
};
