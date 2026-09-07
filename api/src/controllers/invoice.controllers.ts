import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { Booking } from '../models/Booking.js';
import { UserRole } from '../models/User.js';

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }
    const isOwner = booking.id_voyageur.toString() === req.user?._id.toString();
    const isAdmin = req.user?.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé à cette facture' });
    }
    const invoice = await Invoice.findOne({ id_booking: bookingId });
    if (!invoice || !invoice.pdf_data) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    
    res.setHeader(
      'Content-Disposition',
      `inline; filename="INV-${invoice.numero_facture}.pdf"`
    );
    return res.send(invoice.pdf_data);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la facture:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération du PDF' });
  }
};
