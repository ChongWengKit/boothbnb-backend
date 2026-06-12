import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { UpdateAdminRequestParams } from '../types/types.js';
export declare const registerAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAdminApproval: (req: Request<UpdateAdminRequestParams>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
export declare const getApprovalRequests: (req: Request<{}>, res: Response<ApiResponse<any>>) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
//# sourceMappingURL=admin.controller.d.ts.map