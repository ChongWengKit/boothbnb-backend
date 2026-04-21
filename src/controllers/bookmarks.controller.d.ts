import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { SearchEventResponse } from '../types/types.js';
export declare const addFavorite: (req: Request, res: Response<ApiResponse<{}>>) => Promise<Response<ApiResponse<{}>, Record<string, any>>>;
export declare const deleteFavorite: (req: Request, res: Response<ApiResponse<{}>>) => Promise<Response<ApiResponse<{}>, Record<string, any>>>;
export declare const getFavoriteBookmarkId: (req: Request, res: Response<ApiResponse<number[]>>) => Promise<Response<ApiResponse<number[]>, Record<string, any>>>;
export declare const getFavorite: (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => Promise<Response<ApiResponse<SearchEventResponse>, Record<string, any>>>;
//# sourceMappingURL=bookmarks.controller.d.ts.map