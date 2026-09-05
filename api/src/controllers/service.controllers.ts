import { Request, Response } from 'express';
import { Service } from '../models/Service.js';

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Erreur création service', error });
  }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ actif: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération services', error });
  }
};