import { Category } from "@prisma/client";

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  role: Role
}

export interface SignupData {
  id: number;
  email: string;
  username: string;
  created_at: Date;
}
export enum Role {
  VENDOR = 'VENDOR',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
}

export enum BoothType {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  LOCKED = 'LOCKED',
}

export enum ActionType {
  HOST_APPROVAL = 'HOST_APPROVAL',

}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | undefined;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  id: number;
  email: string;
  username: string;
  role?: Role;
  created_at: Date;
  authentication_token?: string;
  profile_photo?: string | null;

}

export interface SearchEventRequest {
  title?: string | null | undefined;
  longitude?: number | null | undefined;
  latitude?: number | null | undefined;
  start_date?: Date | null | undefined;
  end_date?: Date | null | undefined;
  category?: string | undefined;
  type?: string | undefined;
  ne_lat?: number | null | undefined;
  ne_lng?: number | null | undefined;
  sw_lat?: number | null | undefined;
  sw_lng?: number | null | undefined;
  page?: number;
  limit?: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  address: string;
  longitude: number;
  latitude: number;
  start_date: string;
  end_date: string;
  currency_code: string;
  category: Category;
  images: string[];
  booths: Array<{
    name: string;
    price: number;
    type: BoothType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    description: string | undefined;
  }>;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  currency_code?: string;
  category? : Category;
  booths?: Array<{
    id: number;
    name: string;
    type: BoothType;
    price: any;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    description?: string;
  }>;
  start_date?: string;
  end_date?: string;
  category_id?: number;
  images?: string[];
}

export type SearchEventResponse = Array<{
  id: number;
  title: string;
  slug: string;
  address: string;
  start_date: Date;
  end_date: Date;
  latitude: number;
  longitude: number;
  thumbnail: string | null;
  total_capacity: number;
  total_bookings: number;
  available_booths?: number;
  is_bookmarked?: boolean;
}>;

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export interface CloudinarySignatureParams {
  timestamp: number;
  folder: string;
}

export interface CloudinarySignatureResponse {
  signature: string;
  apiKey: string;
  cloudName: string;
  timestamp: number;
  folder: string;
  allowedFormats: string[];
}



export interface EventParamsResponse {
  id: number;
  title: string;
  description: string;
  currency_code: string;
  address: string;
  longitude: number;
  latitude: number;
  start_date: Date;
  status: EventStatus;
  slug: string;
  end_date: Date;
  host_id: number;
  username: string;
  profile_photo: string | null;
  booths: Array<{
    id: number;
    name: string;
    type: BoothType;
    price: any;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  images: Array<{
    url: string;
  }>;
  total_capacity: number;
  total_bookings: number;
  available_booths: number;
  bookmarks_count: number;
  is_bookmarked: boolean;
}

export enum EmailLogCategory {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  HOST_APPROVE = 'HOST_APPROVE'
}

export enum AdminRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export interface UpdateAdminRequestParams {
  id: number;
  status?: AdminRequestStatus;
}

declare global {
  namespace Express {
    interface Request {
      user?: User; 
    }
  }
}
declare global {
  namespace Express {
    interface ParamsDictionary {
      slug?: string;
    }
  }
}
export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  stripe_account_id?: string
}