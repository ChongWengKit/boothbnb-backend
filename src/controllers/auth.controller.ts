import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { Role } from '../types/types.js';
import { SignInResponse } from '../types/types.js';
import { SignupData, SignupRequest } from '../types/types.js';
import { SignInRequest } from '../types/types.js';
import { authService } from '../services/auth.service.js';
import { accountService } from '../services/account.service.js';
import { mailService } from '../services/mail.service.js';

//test vercel
export const googleSignIn = async (req: Request<{ token: string }>, res: Response<ApiResponse<SignInResponse>>) => {
  try {
    const { token } = req.body;

    const tokenResult = await accountService.verifyGoogleToken(token);
    let result = await accountService.googleSignIn(tokenResult.email);
    let user = result.user;
    let authenticationToken = result.authenticationToken;
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
  } catch (error: any) {
    if (error.message === "INVALID_TOKEN") {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.message === "EXPIRED_TOKEN") {
      return res.status(401).json({ success: false, message: 'Expired token.' });
    }
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User does not exist. Please sign up first.' });
    }
    if (error.message === "USER_ALREADY_REGISTERED") {
      return res.status(400).json({ success: false, message: 'Please sign in with email and password.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const googleSignUp = async (req: Request<{ token: string, role: Role }>, res: Response<ApiResponse<SignInResponse>>) => {
  try {
    const { token, role } = req.body;

    const { email, name, picture } = await accountService.verifyGoogleToken(token);
    const user = await accountService.googleSignUp(email, role, name, picture);
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
    const authenticationToken = await authService.createAuthenticationToken(user.id, user.username, user.email, user.role);

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
  } catch (error: any) {
    if (error.message === "INVALID_TOKEN") {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.message === "EXPIRED_TOKEN") {
      return res.status(401).json({ success: false, message: 'Expired token.' });
    }
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User does not exist. Please sign up first.' });
    }
    if (error.message === "USER_ALREADY_REGISTERED") {
      return res.status(400).json({ success: false, message: 'Please sign in with email and password.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request<{ password: string, token: string }>, res: Response<ApiResponse<{}>>) => {
  try {
    const { password, token } = req.body;

    await accountService.resetPassword(password, token);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error: any) {
    if (error.message === "TOKEN_NOT_FOUND") {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.message === "EXPIRED_TOKEN") {
      return res.status(401).json({ success: false, message: 'Expired token.' });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (error.message === "INVALID_PASSWORD") {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { username, password, token } = req.body;

    await accountService.adminSignUp(username, password, token);

    return res.status(200).json({ success: true, message: 'Admin account set up successfully. You can now log in.' });
  } catch (error: any) {
    if (error.message === "TOKEN_ERROR") {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (error.message === "USERNAME_ALREADY_TAKEN") {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }
    if (error.message === "INVALID_PASSWORD") {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error during admin signup.' });
  }
};

export const signin = async (req: Request<{}, {}, SignInRequest>, res: Response<ApiResponse<SignInResponse>>) => {
  const { email, password } = req.body;
  try {
    const user = await accountService.signIn(email, password);
    const token = await authService.createAuthenticationToken(user.id, user.username, user.email, user.role);

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
  } catch (error:any) {
    if(error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if(error.message === "PASSWORD_INCORRECT") {
      return res.status(400).json({ success: false, message: 'Invalid password.' });
    }
    if(error.message === "USER_NOT_VERIFIED") {
      return res.status(401).json({ success: false, message: 'User not verified.' });
    }

    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const signup = async (req: Request<{}, {}, SignupRequest>, res: Response<ApiResponse<SignupData>>) => {
  const { email, username, password, role } = req.body;
  const maxUsernameLength = 50;


  try {
    const result = await accountService.signUp(email, username, password, role);
    const user = result.user;
    const log = result.log;

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
      await mailService.attemptSend(log.id);
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

  } catch (error:any) {
    if (error.message === "USERNAME_TOO_LONG") {
      return res.status(400).json({ success: false, message: `Username must be less than ${maxUsernameLength} characters.` });
    }
    if (error.message === "USERNAME_ALREADY_TAKEN") {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }
    if (error.message === "EMAIL_ALREADY_EXIST") {
      return res.status(400).json({ success: false, message: 'Email already taken.' });
    }
    if (error.message === "INVALID_EMAIL") {
      return res.status(400).json({ success: false, message: 'Invalid email.' });
    }
    if (error.message === "INVALID_ROLE") {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (error.message === "INVALID_PASSWORD") {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request<{ email: string }>, res: Response<ApiResponse<{}>>) => {
  try {
    const { email } = req.body;

    await accountService.forgotPassword(email);
    return res.status(200).json({ success: true, message: 'Reset password email sent successfully.' });
  } catch (error:any) {
    if( error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verify = async (req: Request, res: Response<ApiResponse<{ authentication_token: string, profile_photo: string | null }>>) => {
  try {
    const { token } = req.body;

    const result = await accountService.verifyAccount(token);
    const user = result.user;
    const authenticationToken = result.authenticationToken;

    return res.status(200).json({ success: true, message: 'Email verified successfully.', data: { authentication_token: authenticationToken, profile_photo: user.profile_photo } });
  } catch (error: any) {
    if (error.message === "TOKEN_NOT_FOUND") {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.message === "TOKEN_EXPIRED") {
      return res.status(401).json({ success: false, message: 'Expired token.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
