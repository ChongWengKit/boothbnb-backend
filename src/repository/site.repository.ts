import { prisma } from '../lib/db.js';
import { EventStatus } from '@prisma/client';
const getAllEventSlugs = async () => {
  const events = await prisma.events.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      OR: [
        {
          start_date: {
            gt: new Date().toISOString()
          }
        },
        {
          end_date: {
            lt: new Date().toISOString()
          }
        }
      ]
    },
    select: {
      slug: true
    }
  });
  return events.map(event => event.slug);
};

export const siteRepository = {
  getAllEventSlugs,
};
