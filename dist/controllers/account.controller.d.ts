import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
export declare const getAccount: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const getPublicAccount: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const updateProfilePhoto: (req: Request, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
//# sourceMappingURL=account.controller.d.ts.map