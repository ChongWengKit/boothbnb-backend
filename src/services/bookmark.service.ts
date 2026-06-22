import { BoothType } from '../types/types.js';
import { bookmarkRepository } from '../repository/bookmark.repository.js';
const getFavoriteBookmarks = async (userId: string, page: number, limit: number) => {
    const { bookmarks, total } = await bookmarkRepository.findBookmarkByUserId(parseInt(userId), page, limit);

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
            latitude: event.latitude,
            longitude: event.longitude,
            thumbnail: thumbnail,
            total_capacity,
            total_bookings,
            available_booths: total_capacity - total_bookings,
        };
    })
    const totalPages = Math.ceil(total / limit);

    return { bookmarks: formattedEvents, total, totalPages };
}

export const bookmarkService = {
    getFavoriteBookmarks,
}