import { getAllEventSlugs } from '../services/site.service.js';
export const getAllEventSlug = async (req, res) => {
    try {
        const events = await getAllEventSlugs();
        return res.status(200).json({ status: 'success', data: events });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: 'Failed to fetch event slugs' });
    }
};
//# sourceMappingURL=site.controllers.js.map