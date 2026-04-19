import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
export const createBookmark = async ( user_id:number, event_id:number ) => {
  return prisma.bookmarks.upsert({
    where: {
      user_id_event_id: {
        user_id: user_id,
        event_id: event_id,
      },
    },
    update: {}, 
    create: {
      event_id: event_id,
      user_id: user_id,
    },
  });
}
export const deleteBookmark = async (user_id:number, event_id:number ) => {
  return prisma.bookmarks.delete({
    where: {
      user_id_event_id: {
        user_id: user_id,
        event_id: event_id,
      },
    },
  });
}

export const findBookmarkByUserId = async (user_id: number, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const [bookmarks, total] = await Promise.all([
    prisma.bookmarks.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        event: {
          include: {
            images: {
              take: 1,
              select: { url: true }
            },
            _count: {
              select: { booths: true }
            },
            booths: {
              select: { type: true }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.bookmarks.count({ where: { user_id: user_id } })
  ]);
  return { bookmarks, total };
};

export const findBookmarkIdkByUserId = async (user_id: number) => {
  return prisma.bookmarks.findMany({
    select: {
      event_id: true,
    },
    where: {
      user_id: user_id,
    },
    orderBy: {
      created_at: 'desc'
    }
  });
};

export const isBookmarked = async (user_id: number, event_id: number) => {
  const bookmark = await prisma.bookmarks.findUnique({
    where: {
      user_id_event_id: {
        user_id,
        event_id,
      },
    },
  });
  return !!bookmark;
};
