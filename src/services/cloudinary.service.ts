import { v2 as cloudinary } from "cloudinary";
const generateCloudinarySignatureAction = async (timestamp: number, folder: string) => {
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
    const CLOUDINARY_UPLOAD_FOLDER = process.env.CLODINARY_UPLOAD_FOLDER || "";

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });

    const signature = cloudinary.utils.api_sign_request(
        { paramsToSign: { timestamp, folder }, folder: CLOUDINARY_UPLOAD_FOLDER },
        CLOUDINARY_API_SECRET,
    );
    return signature;
}

export const cloudinaryService = { generateCloudinarySignatureAction };
