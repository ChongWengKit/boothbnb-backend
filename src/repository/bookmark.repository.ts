import { prisma } from '../lib/db.js';
const createBookmark = async ( user_id:number, event_id:number ) => {
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
const deleteBookmark = async (user_id:number, event_id:number ) => {
  return prisma.bookmarks.delete({
    where: {
      user_id_event_id: {
        user_id: user_id,
        event_id: event_id,
      },
    },
  });
}

const findBookmarkByUserId = async (user_id: number, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const [bookmarks, total] = await Promise.all([
    prisma.bookmarks.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            address: true,
            start_date: true,
            end_date: true,
            latitude: true,
            longitude: true,
            total_slots: true,
            available_slots: true,
            images: {
              take: 1,
              select: { url: true }
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

const findBookmarkIdkByUserId = async (user_id: number) => {
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

const isBookmarked = async (user_id: number, event_id: number) => {
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

const findBookmarkedEventIdsByUserId = async (user_id: number, event_ids: number[]) => {
  if (event_ids.length === 0) return new Set<number>();
  const bookmarks = await prisma.bookmarks.findMany({
    where: {
      user_id: user_id,
      event_id: { in: event_ids },
    },
    select: {
      event_id: true,
    },
  });
  return new Set(bookmarks.map((b) => b.event_id));
};

export const bookmarkRepository = {
  createBookmark,
  deleteBookmark,
  findBookmarkByUserId,
  findBookmarkIdkByUserId,
  isBookmarked,
  findBookmarkedEventIdsByUserId,
};