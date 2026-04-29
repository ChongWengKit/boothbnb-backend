import { Request, Response, NextFunction } from 'express';

export const isHost = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ message: 'Not authenticated' });
    }
  if (req.user?.role !== 'HOST') {
    return res.status(403).json({ message: 'Host access required' });
  }
  next();
};

export const isVendor = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ message: 'Not authenticated' });
    }
  if (req.user?.role !== 'VENDOR') {
    return res.status(403).json({ message: 'Vendor access required' });
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
       return res.status(401).json({ message: 'Not authenticated' });
    }
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

