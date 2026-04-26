import { ApiResponse, CreateEventRequest, SearchEventResponse, UpdateEventRequest } from '../types/types.js';
import type { Request, Response } from 'express';
import { EventParamsResponse } from '../types/types.js';
export declare const searchEvents: (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => Promise<Response<ApiResponse<SearchEventResponse>, Record<string, any>>>;
export declare const createEvent: (req: Request<{}, {}, CreateEventRequest>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const updateEvent: (req: Request<{
    slug: string;
}, {}, UpdateEventRequest>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const publishEvent: (req: Request<{
    slug: string;
}>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const closeEvent: (req: Request<{
    slug: string;
}>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const findEventsByHostId: (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => Promise<Response<ApiResponse<SearchEventResponse>, Record<string, any>>>;
export declare const getEventBySlug: (req: Request, res: Response<ApiResponse<EventParamsResponse>>) => Promise<Response<ApiResponse<EventParamsResponse>, Record<string, any>>>;
export declare const getEventDetailsBySlug: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const getEventEditBySlug: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const checkoutByUpdateEventReserved: (req: Request<{
    eventId: string;
    boothId: string;
}>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
//# sourceMappingURL=event.controller.d.ts.map