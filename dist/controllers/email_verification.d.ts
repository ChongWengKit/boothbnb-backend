import { ApiResponse } from '../types/types.js';
import type { Request, Response } from 'express';
export declare const verify: (req: Request, res: Response<ApiResponse<{
    authentication_token: string;
}>>) => Promise<Response<ApiResponse<{
    authentication_token: string;
}>, Record<string, any>>>;
//# sourceMappingURL=email_verification.d.ts.map