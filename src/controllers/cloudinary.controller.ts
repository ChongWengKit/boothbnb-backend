import { Request, Response } from "express";
import { ApiResponse, CloudinarySignatureParams, CloudinarySignatureResponse } from "../types/types.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

export const generateCloudinarySignatureAction = async (req: Request<{}, {}, CloudinarySignatureParams>, res: Response<ApiResponse<CloudinarySignatureResponse>>) => {
  try {
    const paramsToSign = req.body;

    const signatureData = await cloudinaryService.generateCloudinarySignatureAction(paramsToSign.timestamp, paramsToSign.folder);
    return res.status(200).json({
      success: true,
      message: 'Signature generated successfully.',
      data: {
        signature: signatureData.signature,
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        timestamp: signatureData.timestamp,
        folder: signatureData.folder,
        allowedFormats: signatureData.allowedFormats,
      }
    });

  }
  catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error generating upload signature.' });
  }
};