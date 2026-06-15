import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { ApiResponse } from '../types/types.js';
import { findUserByEmail, createUser, resetUserPasswordAndRemoveToken, finalizeUserRegistrationAndRemoveToken } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import { Role } from '../types/types.js';
import { SignInResponse } from '../types/types.js';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';
import { Prisma, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { logEmail, attemptSend } from '../services/mail.service.js';
import { deleteUser } from '../services/auth.service.js';
import { findUserById, updateUserPassword } from '../services/auth.service.js';
import { getResetTokenByToken, deleteResetTokenByToken } from '../services/auth.service.js';
import { findUserByUsername } from '../services/auth.service.js';
import { SignupData, SignupRequest } from '../types/types.js';
import { SignInRequest } from '../types/types.js';
import { findResetTokenByUserId } from '../services/auth.service.js';
import { deleteVerifyTokenByToken, getVerifyTokenByToken } from '../services/auth.service.js';
import { verifyUser } from '../services/auth.service.js';
import { createAdminRequest, deleteAdminRequestByUserId, deleteUserAndAdminRequests } from '../services/admin.service.js';
import { getAdminTokenByToken, deleteAdminTokenByToken, } from '../services/auth.service.js';
import { ActionType } from '../types/types.js';
import validator from 'validator';
//test vercel
export const googleSignIn = async (req: Request<{ token: string }>, res: Response<ApiResponse<SignInResponse>>) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    const { iat, exp } = data;
    if (!iat || !exp || exp < Date.now() / 1000) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId !== data.aud || googleClientId !== data.azp) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    const email = data.email;

    let user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist. Please sign up first.' });
    }
    else {
      if (user.password !== null && user.salt !== null) {
        return res.status(400).json({ success: false, message: 'Please sign in with email and password.' });
      }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not defined.' });
    }

    const authenticationToken = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, secret, {
      expiresIn: '30d',
    });

    return res.status(200).json({
      success: true,
      message: 'User signed up successfully.',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as Role,
        created_at: user.created_at,
        authentication_token: authenticationToken,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const googleSignUp = async (req: Request<{ token: string, role: Role }>, res: Response<ApiResponse<SignInResponse>>) => {
  try {
    const { token, role } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    const { iat, exp } = data;
    if (!iat || !exp || exp < Date.now() / 1000) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId !== data.aud || googleClientId !== data.azp) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    const email = data.email;
    const name = data.name + Math.floor(Math.random() * 10000);
    const photo = data.picture;
    let user = await findUserByEmail(email);
    const allowedRoles = [Role.HOST, Role.VENDOR];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (!user) {
      let is_verfied = true;
      if (role === Role.HOST) {
        is_verfied = false;
      }

      let profile_photo = null;
      if (photo) {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
            api_key: process.env.CLOUDINARY_API_KEY as string,
            api_secret: process.env.CLOUDINARY_API_SECRET as string,
          });
          const uploadResponse = await cloudinary.uploader.upload(photo, {
            folder: 'Profiles',
          });
          profile_photo = uploadResponse.secure_url;
        } catch (uploadError) {
        }
      }
      ({ user } = await createUser({
        email,
        username: name,
        role: role,
        is_verified: is_verfied,
        profile_photo: profile_photo,
      }, false));
    }
    else {
      return res.status(409).json({ success: false, message: 'User already exists. Please sign in instead.' });
    }
    if (role === Role.HOST) {
      return res.status(201).json({
        success: true,
        message: 'Extra action required, please contact site admin.',
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
      });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not defined.' });
    }

    const authenticationToken = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, secret, {
      expiresIn: '30d',
    });

    return res.status(200).json({
      success: true,
      message: 'User signed up successfully.',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as Role,
        created_at: user.created_at,
        authentication_token: authenticationToken,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request<{ password: string, token: string }>, res: Response<ApiResponse<{}>>) => {
  try {
    const { password, token } = req.body;
    if (!password || !token) {
      return res.status(400).json({ success: false, message: 'Password and token are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await getResetTokenByToken(hashedToken);
    if (!resetToken) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    if (new Date(resetToken.expires_in) < new Date()) {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }

    const user = await findUserById(resetToken.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    await resetUserPasswordAndRemoveToken(resetToken.user_id, hashedPassword, salt, hashedToken);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { username, password, token } = req.body;

    if (!username || !password || !token) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const adminToken = await getAdminTokenByToken(hashedToken);

    if (!adminToken || new Date(adminToken.expires_in) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
    }

    const user = await findUserByEmail(adminToken.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invited user record not found.' });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    await finalizeUserRegistrationAndRemoveToken(user.id, {
      username,
      password: hashedPassword,
      salt,
      is_verified: true
    }, hashedToken);

    return res.status(200).json({ success: true, message: 'Admin account set up successfully. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error during admin signup.' });
  }
};

export const signin = async (req: Request<{}, {}, SignInRequest>, res: Response<ApiResponse<SignInResponse>>) => {
  const { email, password } = req.body;
  const secret = process.env.JWT_SECRET;
  try {
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not defined.' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.is_verified === false) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email before signing in.' });
    }
    if (user.password === null || user.salt === null) {
      return res.status(400).json({ success: false, message: 'Password is incorrect.' });
    }
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (hashedPassword !== user.password) {
      return res.status(400).json({ success: false, message: 'Password is incorrect.' });
    }

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, secret, {
      expiresIn: '30d',
    });
    return res.status(200).json({
      success: true,
      message: 'User signed in successfully.',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as Role,
        created_at: user.created_at,
        authentication_token: token,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const signup = async (req: Request<{}, {}, SignupRequest>, res: Response<ApiResponse<SignupData>>) => {
  const { email, username, password, role } = req.body;
  const maxUsernameLength = 50;


  try {
    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Email, username, and password are required.' });
    }

    const allowedRoles = [Role.HOST, Role.VENDOR];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const existingEmail = await findUserByEmail(email);
    if (existingEmail && existingEmail.is_verified) {
      return res.status(500).json({ success: false, message: 'Email already exist.' });
    }
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (existingEmail && existingEmail.created_at > thirtyMinutesAgo) {
      return res.status(409).json({ success: false, message: 'Email already exists and was created within the last 30 minutes. Please try again later.' });
    }
    if (existingEmail) {
      await prisma.verify_tokens.deleteMany({
        where: {
          user_id: existingEmail.id,
        },
      });
      await deleteUserAndAdminRequests(existingEmail.id);
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }

    if (username.length > maxUsernameLength) {
      return res.status(400).json({ success: false, message: `Username cannot exceed ${maxUsernameLength} characters.` });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const { user, log } = await createUser({
      email,
      username,
      password: hashedPassword,
      role,
      salt,
    }, true);

    if (role === Role.HOST) {
      return res.status(200).json({
        success: true,
        message: 'Extra action required, please contact site admin.',
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
      });
    }
    if (log) {
      await attemptSend(log.id);
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully. Email sent.',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request<{ email: string }>, res: Response<ApiResponse<{}>>) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with email does not exist.' });
    }
    const log = await logEmail(user.id, EmailLogCategory.PASSWORD_RESET, { email, name: user.username });
    attemptSend(log.id);
    return res.status(200).json({ success: true, message: 'Reset password email sent successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verify = async (req: Request, res: Response<ApiResponse<{ authentication_token: string, profile_photo: string | null }>>) => {
  try {
    const { token } = req.body;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT_SECRET is not defined.' });
    }

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const verifyToken = await getVerifyTokenByToken(hashedToken);
    if (!verifyToken) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    if (new Date(verifyToken.expires_in) < new Date()) {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }
    const user = await verifyUser(verifyToken.user_id);

    const authenticationToken = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, secret, {
      expiresIn: '30d',
    });

    await deleteVerifyTokenByToken(hashedToken);

    return res.status(200).json({ success: true, message: 'Email verified successfully.', data: { authentication_token: authenticationToken, profile_photo: user.profile_photo } });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
}
