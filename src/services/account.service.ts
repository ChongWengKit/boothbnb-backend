import { authRepository } from '../repository/auth.repository.js';
import { StreamingProfiles } from 'cloudinary';
import jwt from 'jsonwebtoken';
import { Role } from '../types/types.js';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';
import validator from 'validator';
import { adminRepository } from '../repository/admin.repository.js';
import { mailRepository } from '../repository/mail.repository.js';
import { Prisma, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { authService } from './auth.service.js';
import { mailService} from './mail.service.js';
const getUserByUsername = async (username: string) => {
    const user = await authRepository.findUserByUsername(username);
    return user;
};
const getUserByEmail = async (email: string) => {
    const user = await authRepository.findUserByEmail(email);
    return user;
}

const googleSignIn = async (email: StreamingProfiles) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    else {
        if (user.password !== null && user.salt !== null) {
            throw new Error("USER_ALREADY_REGISTERED");
        }
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined.");
    }

    const authenticationToken = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    }, secret, {
        expiresIn: '30d',
    });
    return { user, authenticationToken };
}

const updateProfilePhoto = async (userId: number, photoUrl: string) => {
    return await authRepository.updateUserProfilePhoto(userId, photoUrl);
}
const verifyGoogleToken = async (token: string) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const response = await fetch(url);
    const data = await response.json();
    const { iat, exp, aud, azp, email, name, picture } = data;
    if (!iat || !exp || exp < Date.now() / 1000) {
        throw new Error('Invalid or expired token.');
    }
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId !== data.aud || googleClientId !== data.azp) {
        throw new Error('Unauthorized.');
    }
    return { email, name, picture };
}

const googleSignUp = async (email: string, role: Role, name: string, picture?: string,) => {
    let user = await authRepository.findUserByEmail(email);
    const allowedRoles = [Role.HOST, Role.VENDOR];

    if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role.');
    }
    if (!user) {
        let is_verfied = true;
        if (role === Role.HOST) {
            is_verfied = false;
        }

        let profile_photo = null;
        if (picture) {
            try {
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
                    api_key: process.env.CLOUDINARY_API_KEY as string,
                    api_secret: process.env.CLOUDINARY_API_SECRET as string,
                });
                const uploadResponse = await cloudinary.uploader.upload(picture, {
                    folder: 'Profiles',
                });
                profile_photo = uploadResponse.secure_url;
            } catch (uploadError) {
            }
        }
        ({ user } = await authRepository.createUser({
            email,
            username: name,
            role: role,
            is_verified: is_verfied,
            profile_photo: profile_photo,
        }, false));
    }
    else {
        throw new Error('USER_ALREADY_REGISTERED');
    }
    return user;
}

const resetPassword = async (password: string, token: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await authRepository.getResetTokenByToken(hashedToken);
    if (!resetToken) {
        throw new Error('TOKEN_NOT_FOUND');
    }

    if (new Date(resetToken.expires_in) < new Date()) {
        throw new Error('TOKEN_EXPIRED');
    }

    const user = await authRepository.findUserById(resetToken.user_id);
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    await authRepository.resetUserPasswordAndRemoveToken(resetToken.user_id, hashedPassword, salt, hashedToken);
}

const adminSignUp = async (username: string, password: string, token: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const adminToken = await authRepository.getAdminTokenByToken(hashedToken);

    if (!adminToken || new Date(adminToken.expires_in) < new Date()) {
        throw new Error('TOKEN_ERROR');
    }

    const user = await authRepository.findUserByEmail(adminToken.email);
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
        throw new Error('USERNAME_ALREADY_TAKEN');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    await authRepository.finalizeUserRegistrationAndRemoveToken(user.id, {
        username,
        password: hashedPassword,
        salt,
        is_verified: true
    }, hashedToken);

}

const signIn = async (email: string, password: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }
    if (user.is_verified === false) {
        throw new Error('EMAIL_NOT_VERIFIED');
    }
    if (user.password === null || user.salt === null) {
        throw new Error('PASSWORD_INCORRECT');
    }
    const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (hashedPassword !== user.password) {
        throw new Error('PASSWORD_INCORRECT');
    }
    return user;
}

const signUp = async (email: string, username: string, password: string, role: Role) => {
    const allowedRoles = [Role.HOST, Role.VENDOR];

    if (!allowedRoles.includes(role)) {
        throw new Error('INVALID_ROLE');
    }
    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail && existingEmail.is_verified) {
        throw new Error('EMAIL_ALREADY_EXIST');
    }
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (existingEmail && existingEmail.created_at > thirtyMinutesAgo) {
        throw new Error('EMAIL_ALREADY_EXIST');
    }
    if (existingEmail) {
        await prisma.verify_tokens.deleteMany({
            where: {
                user_id: existingEmail.id,
            },
        });
        await adminRepository.deleteUserAndAdminRequests(existingEmail.id);
    }
    if (!validator.isEmail(email)) {
        throw new Error('INVALID_EMAIL');
    }
    const existingUsername = await authRepository.findUserByUsername(username);
    if (existingUsername) {
        throw new Error('USERNAME_ALREADY_TAKEN');
    }

    if (username.length > 50) {
        throw new Error('USERNAME_TOO_LONG');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const { user, log } = await authRepository.createUser({
        email,
        username,
        password: hashedPassword,
        role,
        salt,
    }, true);
    return { user, log };
}

const forgotPassword = async (email: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }
    const log = await mailRepository.logEmail(user.id, EmailLogCategory.PASSWORD_RESET, { email, name: user.username });
    await mailService.attemptSend(log.id);
}

const verifyAccount = async (token: string) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET_ERROR');
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const verifyToken = await authRepository.getVerifyTokenByToken(hashedToken);
    if (!verifyToken) {
        throw new Error('TOKEN_NOT_FOUND');
    }

    if (new Date(verifyToken.expires_in) < new Date()) {
        throw new Error('TOKEN_EXPIRED');
    }
    const user = await authRepository.verifyUser(verifyToken.user_id);

    const authenticationToken = await authService.createAuthenticationToken(user.id, user.username, user.email, user.role);

    await authRepository.deleteVerifyTokenByToken(hashedToken);
    return { user, authenticationToken };
}
export const accountService = {
    getUserByUsername,
    updateProfilePhoto,
    getUserByEmail,
    verifyGoogleToken,
    googleSignIn,
    googleSignUp,
    resetPassword,
    adminSignUp,
    signIn,
    signUp,
    forgotPassword,
    verifyAccount
};
