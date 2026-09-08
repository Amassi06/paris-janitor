import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole, SubscriptionType } from '../models/User.js';
import { offreDisponible } from '../services/pricing.service.js';

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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Configuration JWT manquante' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
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

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  res.json({ user, offre_disponible: offreDisponible(user) });
};

export const getAllUsers = async (re:Request, res:Response):Promise<void> =>{
  try{
    const users = await User.find().select('-password').sort({createdAt:-1});
    res.json(users);
  }catch(error){
    res.status(500).json({message:'Erreur lors de la récupération des utilisateurs',error});
  }
};

export const bannUser = async (req: Request, res: Response):Promise<void> =>{
  try{
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    if(!deleteUser){
      res.status(404).json({ message: "Utilisateur introuvable ou déjà supprimé."});
      return;
    }
    res.status(200).json({ message: "Utilisateur banni avec succès." });
  }catch(error){
        res.status(500).json({message:`Erreur lors de la suppression de utilisateur id: ${req.params.id}`,error});
  }
}