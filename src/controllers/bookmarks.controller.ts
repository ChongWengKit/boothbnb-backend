import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { SearchEventResponse } from '../types/types.js';
import { getEventsByIds } from '../services/event.service.js';
import { findBookmarkIdkByUserId } from '../services/bookmark.service.js';
import { BoothType } from '../types/types.js';
import { createBookmark, deleteBookmark, findBookmarkByUserId } from '../services/bookmark.service.js';
export const addFavorite = async (req: Request, res: Response<ApiResponse<{}>>) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;
    if (!userId || !eventId) {
      throw new Error('Invalid Request.');
    }
    await createBookmark(userId, parseInt(eventId));

    return res.status(201).json({
      success: true,
      message: 'Bookmark successfully.',
    });
  } catch (error) {
    console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const deleteFavorite = async (req: Request, res: Response<ApiResponse<{}>>) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;
    if (!userId || !eventId) {
      throw new Error('Invalid Request.');
    }
    await deleteBookmark(userId, parseInt(eventId));

    return res.status(200).json({
      success: true,
      message: 'Bookmark successfully deleted.',
    });
  } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const getFavoriteBookmarkId = async (req: Request, res: Response<ApiResponse<number[]>>) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new Error('Invalid Request.');
    }
    const bookmarks = await findBookmarkIdkByUserId(userId);
    const bookmarkIds = bookmarks.map(b => b.event_id);
    return res.status(200).json({
      success: true,
      message: 'Bookmark IDs successfully retrieved.',
      data: bookmarkIds,
    });
  } catch (error) {
    console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const getFavorite = async (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!userId) {
      throw new Error('Invalid Request.');
    }
    const { bookmarks, total } = await findBookmarkByUserId(userId, page, limit);

    const formattedEvents = bookmarks.map((item) => {
      const event = item.event;

      const locked_count = event.booths.filter(b => b.type === BoothType.LOCKED).length;
      const total_bookings = event.booths.filter(b => b.type === BoothType.RESERVED || b.type === BoothType.SOLD).length;
      const total_capacity = event._count.booths - locked_count;
      
      const thumbnail = event.images[0]?.url || null;

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        address: event.address,
        start_date: event.start_date,
        end_date: event.end_date,
        thumbnail: thumbnail,
        total_capacity,
        total_bookings,
        available_booths: total_capacity - total_bookings,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: 'Bookmarks successfully retrieved.',
      data: formattedEvents,
      meta: {
        totalItems: total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
