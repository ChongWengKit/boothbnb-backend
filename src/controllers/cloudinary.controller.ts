import { Request, Response } from "express";
import { ApiResponse } from "../types/types.js";
import { CloudinarySignatureResponse } from "../types/types.js";
import { cloudinaryService } from "../services/cloudinary.service.js";
export interface CloudinarySignatureParams {
  timestamp: number;
  folder: string;
}

export const generateCloudinarySignatureAction = async (req: Request<{}, {}, CloudinarySignatureParams>, res: Response<ApiResponse<CloudinarySignatureResponse>>) => {
  try {
    const paramsToSign = req.body;

    const signature = await cloudinaryService.generateCloudinarySignatureAction(paramsToSign.timestamp, paramsToSign.folder);
    return res.status(200).json({
      success: true,
      message: 'Signature generated successfully.',
      data: {
        signature: signature,
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        timestamp: paramsToSign.timestamp,
        folder: paramsToSign.folder
      }
    });

  }
  catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
  }
};