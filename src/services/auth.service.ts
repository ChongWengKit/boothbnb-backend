
import {Role} from '@prisma/client';
import jwt from 'jsonwebtoken';
const createAuthenticationToken = async (id: number, username: string, email: string, role: Role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined.');
    }

    const authenticationToken = jwt.sign({
        id: id,
        username: username,
        email: email,
        role: role,
    }, secret, {
        expiresIn: '30d',
    });
    return authenticationToken;
}

export const authService = { createAuthenticationToken };