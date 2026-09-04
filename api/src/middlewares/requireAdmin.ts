import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.js';

export const authorize = (...rolesAutorises: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    if (!rolesAutorises.includes(req.user.role)) {
      res.status(403).json({ message: 'Accès refusé : privilèges insuffisants' });
      return;
    }

    next();
  };
};