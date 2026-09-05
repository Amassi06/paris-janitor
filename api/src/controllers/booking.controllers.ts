import { Request, Response } from 'express';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { SubscriptionType } from '../models/User.js';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_service, date_prestation } = req.body;
    const user = req.user!;

    const service = await Service.findById(id_service);
    if (!service || !service.actif) {
      res.status(404).json({ message: 'Service introuvable ou inactif' });
      return;
    }

    let prix_calcule = service.prix_base;
    if (user.subscription === SubscriptionType.EXPLORATOR) {
      prix_calcule = prix_calcule * 0.95; // -5% de réduction
    }

    const booking = await Booking.create({
      id_voyageur: user._id,
      id_service: service._id,
      date_prestation,
      prix_final: prix_calcule,
      statut: BookingStatus.PENDING 
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création réservation', error });
  }
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ id_voyageur: req.user!._id }).populate('id_service');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération réservations', error });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { note, commentaire } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({ _id: bookingId, id_voyageur: req.user!._id });
    
    if (!booking) {
      res.status(404).json({ message: 'Réservation introuvable' });
      return;
    }
    
    if (booking.statut !== BookingStatus.COMPLETED) {
      res.status(400).json({ message: 'La prestation doit être terminée pour être évaluée' });
      return;
    }

    booking.note = note;
    booking.commentaire = commentaire;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Erreur ajout évaluation', error });
  }
};