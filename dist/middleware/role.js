export const isHost = (req, res, next) => {
    if (!req.user) {
        console.log("User not authenticated in isHost middleware");
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user?.role !== 'HOST') {
        return res.status(403).json({ error: 'Host access required' });
    }
    console.log("User authenticated as host:", req.user);
    next();
};
export const isVendor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user?.role !== 'VENDOR') {
        return res.status(403).json({ error: 'Vendor access required' });
    }
    next();
};
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        console.log("User not authenticated in isAdmin middleware");
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
//# sourceMappingURL=role.js.map