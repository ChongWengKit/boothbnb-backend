import { Request, Response, NextFunction } from 'express';

export const isHost = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ error: 'Not authenticated' });
    }
  if (req.user?.role !== 'HOST') {
    return res.status(403).json({ error: 'Host access required' });
  }
  next();
};

export const isVendor = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ error: 'Not authenticated' });
    }
  if (req.user?.role !== 'VENDOR') {
    return res.status(403).json({ error: 'Vendor access required' });
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ error: 'Not authenticated' });
    }
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

