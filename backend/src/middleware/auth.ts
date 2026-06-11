import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token ist ungültig oder abgelaufen' });
      }

      req.user = user as AuthenticatedRequest['user'];
      next();
    });
  } else {
    res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Diese Aktion erfordert Administrator-Rechte.' });
  }
  next();
};
