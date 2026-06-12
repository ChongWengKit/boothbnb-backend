import { deleteVerifyTokenByToken, getVerifyTokenByToken } from '../services/auth.service.js';
import { verifyUser } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
export const verify = async (req, res) => {
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
        return res.status(200).json({ success: true, message: 'Email verified successfully.', data: { authentication_token: authenticationToken } });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=email_verification.js.map