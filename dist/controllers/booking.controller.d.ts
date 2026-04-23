import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
export declare const getUserBookings: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const getUserPaidBookings: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const getBookingById: (req: Request<{
    id: string;
}>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
//# sourceMappingURL=booking.controller.d.ts.map