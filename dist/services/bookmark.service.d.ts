export declare const createBookmark: (user_id: number, event_id: number) => Promise<{
    id: number;
    created_at: Date;
    user_id: number;
    event_id: number;
}>;
export declare const deleteBookmark: (user_id: number, event_id: number) => Promise<{
    id: number;
    created_at: Date;
    user_id: number;
    event_id: number;
}>;
export declare const findBookmarkByUserId: (user_id: number, page?: number, limit?: number) => Promise<{
    bookmarks: ({
        event: {
            _count: {
                booths: number;
            };
            booths: {
                type: import("@prisma/client").$Enums.BoothType;
            }[];
            images: {
                url: string;
            }[];
        } & {
            id: number;
            category: import("@prisma/client").$Enums.Category;
            title: string;
            description: string;
            address: string;
            start_date: Date;
            end_date: Date;
            status: import("@prisma/client").$Enums.EventStatus;
            latitude: number;
            longitude: number;
            slug: string;
            currency_code: string;
            host_id: number;
        };
    } & {
        id: number;
        created_at: Date;
        user_id: number;
        event_id: number;
    })[];
    total: number;
}>;
export declare const findBookmarkIdkByUserId: (user_id: number) => Promise<{
    event_id: number;
}[]>;
export declare const isBookmarked: (user_id: number, event_id: number) => Promise<boolean>;
//# sourceMappingURL=bookmark.service.d.ts.map