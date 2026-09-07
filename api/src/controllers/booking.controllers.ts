import { Request, Response } from 'express';
import { Booking, BookingStatus } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { SubscriptionType, UserRole } from '../models/User.js';

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
    const bookings = await Booking.find({ id_voyageur: req.user?._id }).populate('id_service');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération réservations', error });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { note, commentaire } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findOne({ _id: bookingId, id_voyageur: req.user?._id });
    
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

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { statut } = req.body;
    const user = req.user!;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Réservation introuvable' });
      return;
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOwner = booking.id_voyageur.toString() === user._id!.toString();

    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Accès refusé à cette réservation' });
      return;
    }

    if (statut === BookingStatus.CANCELLED) {
      if (booking.statut === BookingStatus.COMPLETED) {
        res.status(400).json({ message: 'Une prestation déjà réalisée ne peut pas être annulée' });
        return;
      }
      if (booking.statut === BookingStatus.CANCELLED) {
        res.status(400).json({ message: 'Réservation déjà annulée' });
        return;
      }

      if (!isAdmin && booking.statut !== BookingStatus.PENDING) {
        res.status(400).json({ message: 'Réservation déjà payée : contactez le service client' });
        return;
      }
    } else if (statut === BookingStatus.COMPLETED) {
      if (!isAdmin) {
        res.status(403).json({ message: 'Seul un administrateur peut clôturer une prestation' });
        return;
      }
      if (booking.statut !== BookingStatus.CONFIRMED) {
        res.status(400).json({ message: 'Seule une réservation payée peut être marquée réalisée' });
        return;
      }
    } else {
      res.status(400).json({ message: 'Statut invalide ou transition non autorisée' });
      return;
    }

    booking.statut = statut;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('id_voyageur', 'email')
      .populate('id_service', 'nom prix_base')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération des réservations globales', error });
  }
};