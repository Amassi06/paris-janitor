import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, SubscriptionType } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { offreDisponible } from '../services/pricing.service.js';
import type { Response as ExpressResponse } from 'express';
import type { IUser } from '../models/User.js';

const REFRESH_COOKIE = 'refresh_token';

const signerJetons = (user: IUser, jwtSecret: string) => ({
  access: jwt.sign({ userId: user._id, role: user.role, type: 'access' }, jwtSecret, {
    expiresIn: '15m',
  }),
  refresh: jwt.sign({ userId: user._id, type: 'refresh' }, jwtSecret, { expiresIn: '7d' }),
});

const poserCookieRefresh = (res: ExpressResponse, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, subscription } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      role:UserRole.VOYAGEUR,
      password: hashedPassword,
      subscription: subscription || SubscriptionType.FREE,
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    console.error('Erreur register :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Identifiants invalides' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Identifiants invalides' });
      return;
    }

    if (user.banned) {
      res.status(403).json({ message: 'Ce compte a été banni', code: 'ACCOUNT_BANNED' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Configuration JWT manquante' });
      return;
    }

    const { access, refresh } = signerJetons(user, jwtSecret);
    poserCookieRefresh(res, refresh);

    res.json({
      message: 'Connexion réussie',
      token: access,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Erreur login :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};


export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    const jwtSecret = process.env.JWT_SECRET;

    if (!refreshToken || !jwtSecret) {
      res.status(401).json({ message: 'Session expirée' });
      return;
    }

    const decoded = jwt.verify(refreshToken, jwtSecret) as { userId: string; type: string };
    if (decoded.type !== 'refresh') {
      res.status(401).json({ message: 'Jeton invalide' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'Utilisateur introuvable' });
      return;
    }

    if (user.banned) {
      res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
      res.status(403).json({ message: 'Ce compte a été banni', code: 'ACCOUNT_BANNED' });
      return;
    }

    res.json({ token: signerJetons(user, jwtSecret).access });
  } catch (error) {
    res.status(401).json({ message: 'Session expirée' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ message: 'Déconnexion réussie' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  res.json({ user, offre_disponible: offreDisponible(user) });
};

export const getAllUsers = async (re: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const compteurs = await Booking.aggregate([
      { $group: { _id: '$id_voyageur', total: { $sum: 1 } } },
    ]);
    const parUtilisateur = new Map<string, number>(
      compteurs.map((c) => [String(c._id), c.total])
    );

    res.json(
      users.map((user) => ({
        ...user.toObject(),
        nb_reservations: parUtilisateur.get(String(user._id)) ?? 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
};

export const setUserBan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.params.id === String(req.user!._id)) {
      res.status(400).json({ message: 'Vous ne pouvez pas vous bannir vous-même' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: Boolean(req.body.banned) },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du bannissement', error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscription, role } = req.body;
    const champs: Record<string, unknown> = {};

    if (subscription) {
      if (!Object.values(SubscriptionType).includes(subscription)) {
        res.status(400).json({ message: 'Abonnement invalide' });
        return;
      }
      champs.subscription = subscription;
    }

    if (role) {
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ message: 'Rôle invalide' });
        return;
      }
      champs.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, champs, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error });
  }
};
