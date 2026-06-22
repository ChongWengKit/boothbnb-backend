import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { SearchEventResponse } from '../types/types.js';
import { bookmarkService } from '../services/bookmark.service.js';
import { bookmarkRepository } from '../repository/bookmark.repository.js';
export const addFavorite = async (req: Request, res: Response<ApiResponse<{}>>) => {
  try {
    const { eventId } = req.body;
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userId = req.user.id;
    if (!userId || !eventId) {
      return res.status(400).json({ success: false, message: 'Invalid Request.' });
    }
    await bookmarkRepository.createBookmark(parseInt(userId), parseInt(eventId));

    return res.status(201).json({
      success: true,
      message: 'Bookmark successfully.',
    });
  } catch (error) {
    ;
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const deleteFavorite = async (req: Request, res: Response<ApiResponse<{}>>) => {
  try {
    const { eventId } = req.body;
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userId = req.user.id;
    if (!userId || !eventId) {
      return res.status(400).json({ success: false, message: 'Invalid Request.' });
    }
    await bookmarkRepository.deleteBookmark(parseInt(userId), parseInt(eventId));

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
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid Request.' });
    }
    const bookmarks = await bookmarkRepository.findBookmarkIdkByUserId(parseInt(userId));
    const bookmarkIds = bookmarks.map(b => b.event_id);
    return res.status(200).json({
      success: true,
      message: 'Bookmark IDs successfully retrieved.',
      data: bookmarkIds,
    });
  } catch (error) {
    ;
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export const getFavorite = async (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid Request.' });
    }
    const result = await bookmarkService.getFavoriteBookmarks(userId, page, limit);

    const { bookmarks: formattedEvents, total, totalPages } = result;
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
    ;
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
