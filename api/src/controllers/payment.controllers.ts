import {Request, Response} from 'express';
import Stripe from 'stripe';
import { Booking, BookingStatus} from '../models/Booking.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-08-26.dahlia', 
});

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('id_service');

    if (!booking || booking.statut !== BookingStatus.PENDING) {
      res.status(400).json({ message: 'Réservation invalide ou déjà payée' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Prestation Paris Janitor',
            },
            unit_amount: Math.round(booking.prix_final * 100), // Stripe exige des centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: {
        bookingId: booking._id.toString(), 
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la session Stripe', error });
  }
};