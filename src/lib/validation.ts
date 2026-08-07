import validator from 'validator';
import { AdminRequestStatus } from '../types/types.js';

export const parsePageLimit = (pageValue: unknown, limitValue: unknown, defaultPage = 1, defaultLimit = 10) => {
  const page = typeof pageValue === 'string' && pageValue.trim() ? parseInt(pageValue, 10) : defaultPage;
  const limit = typeof limitValue === 'string' && limitValue.trim() ? parseInt(limitValue, 10) : defaultLimit;
  return { page, limit };
};

export const validatePagination = (page: number, limit: number, maxLimit = 100) => {
  return Number.isInteger(page) && Number.isInteger(limit) && page >= 1 && limit >= 1 && limit <= maxLimit;
};

export const isValidEmail = (email: unknown): email is string => {
  return typeof email === 'string' && validator.isEmail(email);
};

export const isValidUrl = (url: unknown): url is string => {
  return typeof url === 'string' && validator.isURL(url, { require_protocol: true });
};

const validateUrlArray = (images: unknown, predicate: (url: unknown) => url is string, maxImages = 5) => {
  return Array.isArray(images) && images.length <= maxImages && images.every((image) => predicate(image));
};

export const isCloudinaryUrl = (url: unknown): url is string => {
  if (!isValidUrl(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === 'https:' &&
      parsedUrl.hostname.endsWith('cloudinary.com') &&
      parsedUrl.pathname.includes('/image/upload/')
    );
  } catch {
    return false;
  }
};

export const validateImageUrls = (images: unknown, maxImages = 5): boolean => {
  return validateUrlArray(images, isValidUrl, maxImages);
};

export const validateCloudinaryImageUrls = (images: unknown, maxImages = 5): boolean => {
  return validateUrlArray(images, isCloudinaryUrl, maxImages);
};

export const parsePositiveInt = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

export const parseUserId = (value: unknown): number | null => {
  return parsePositiveInt(value);
};

export const isValidUsername = (username: unknown, maxLength = 50): username is string => {
  return typeof username === 'string' && username.trim().length > 0 && username.length <= maxLength;
};

export const isValidAdminRequestStatus = (status: unknown): status is AdminRequestStatus => {
  return typeof status === 'string' && Object.values(AdminRequestStatus).includes(status as AdminRequestStatus);
};
