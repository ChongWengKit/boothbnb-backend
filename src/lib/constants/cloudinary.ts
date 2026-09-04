export const CLOUDINARY_UPLOAD_FOLDERS = ['Events', 'Avatars'] as const;
export type CloudinaryUploadFolder = (typeof CLOUDINARY_UPLOAD_FOLDERS)[number];

export const CLOUDINARY_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;