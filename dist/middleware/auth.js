import jwt from 'jsonwebtoken';
export const checkAuthenticationToken = (req, res, next) => {
    const authenticationToken = req.header('Authorization')?.replace('bearer ', '');
    if (!authenticationToken) {
        return res.status(401).json({ success: false, message: 'Authentication token is required.' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined.');
    }
    try {
        const decodedToken = jwt.verify(authenticationToken, secret);
        console.log("Decoded token:", decodedToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.log("Token verification failed:", error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
};
//# sourceMappingURL=auth.js.map