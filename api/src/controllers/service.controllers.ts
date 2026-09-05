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

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!service) {
      res.status(404).json({ message: 'Service introuvable' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du service', error });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      res.status(404).json({ message: 'Service introuvable' });
      return;
    }
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du service', error });
  }
};