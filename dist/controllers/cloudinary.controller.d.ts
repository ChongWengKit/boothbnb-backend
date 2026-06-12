import { Request, Response } from "express";
import { ApiResponse } from "../types/types.js";
import { CloudinarySignatureResponse } from "../types/types.js";
export interface CloudinarySignatureParams {
    timestamp: number;
    folder: string;
}
export declare const generateCloudinarySignatureAction: (req: Request<{}, {}, CloudinarySignatureParams>, res: Response<ApiResponse<CloudinarySignatureResponse>>) => Promise<Response<ApiResponse<CloudinarySignatureResponse>, Record<string, any>>>;
//# sourceMappingURL=cloudinary.controller.d.ts.map