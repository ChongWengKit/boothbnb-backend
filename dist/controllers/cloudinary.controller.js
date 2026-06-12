import { v2 as cloudinary } from "cloudinary";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLOUDINARY_UPLOAD_FOLDER = process.env.CLODINARY_UPLOAD_FOLDER || "";
export const generateCloudinarySignatureAction = async (req, res) => {
    try {
        const paramsToSign = req.body;
        if (!paramsToSign.timestamp || !paramsToSign.folder) {
            return res.status(400).json({ success: false, message: 'Invalid parameters' });
        }
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
        });
        const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET);
        return res.status(200).json({
            success: true,
            message: 'Signature generated successfully.',
            data: {
                signature: signature,
                apiKey: CLOUDINARY_API_KEY,
                cloudName: CLOUDINARY_CLOUD_NAME,
                timestamp: paramsToSign.timestamp,
                folder: paramsToSign.folder
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
    }
};
//# sourceMappingURL=cloudinary.controller.js.map