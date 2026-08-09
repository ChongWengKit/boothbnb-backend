import { z } from 'zod';
import { Role } from '../../types/types.js';

const roleValues = Object.values(Role) as [string, ...string[]];

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(8, 'Password must be between 8 and 128 characters').max(128, 'Password must be between 8 and 128 characters'),
  role: z.enum(roleValues).refine((r) => r === Role.HOST || r === Role.VENDOR, 'Invalid role'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const googleSignInSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const googleSignUpSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  role: z.enum(roleValues).refine((r) => r === Role.HOST || r === Role.VENDOR, 'Invalid role'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be between 8 and 128 characters').max(128, 'Password must be between 8 and 128 characters'),
  token: z.string().min(1, 'Token is required'),
});

export const adminSignupSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(8, 'Password must be between 8 and 128 characters').max(128, 'Password must be between 8 and 128 characters'),
  token: z.string().min(1, 'Token is required'),
});

export const updateProfilePhotoSchema = z.object({
  profile_photo: z.string().url('Photo URL is required'),
});