import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

interface JwtPayload {
  userId: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Accès non autorisé : jeton absent ou invalide' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || !token) {
      res.status(500).json({ message: 'Configuration serveur invalide pour le JWT' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const currentUser = await User.findById(decoded.userId).select('-password');
    if (!currentUser) {
      res.status(401).json({ message: 'Utilisateur introuvable' });
      return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Jeton expiré ou invalide' });
  }
};