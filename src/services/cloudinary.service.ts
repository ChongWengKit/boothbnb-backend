import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_ALLOWED_FORMATS } from "../lib/constants/cloudinary.js";

export interface CloudinarySignature {
    signature: string;
    timestamp: number;
    folder: string;
    allowedFormats: string[];
}

const generateCloudinarySignatureAction = async (timestamp: number, folder: string): Promise<CloudinarySignature> => {
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });

    const paramsToSign = {
        timestamp,
        folder,
        allowed_formats: [...CLOUDINARY_ALLOWED_FORMATS],
    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        CLOUDINARY_API_SECRET,
    );

    return {
        signature,
        timestamp,
        folder,
        allowedFormats: [...CLOUDINARY_ALLOWED_FORMATS],
    };
}

export const cloudinaryService = { generateCloudinarySignatureAction };
