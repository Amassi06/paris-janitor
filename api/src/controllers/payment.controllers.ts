import {Request, Response} from 'express';
import Stripe from 'stripe';
import { Booking, BookingStatus} from '../models/Booking.js';
import { generateInvoicePDF } from '../services/invoice.service.js';

const getStripe = (): Stripe => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY absente du fichier .env');
  }
  return new Stripe(key);
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('id_service');

    if (!booking || booking.statut !== BookingStatus.PENDING) {
      res.status(400).json({ message: 'Réservation invalide ou déjà payée' });
      return;
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Prestation Paris Janitor',
            },
            unit_amount: Math.round(booking.prix_final * 100), 
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

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    res.status(400).send('Webhook secret ou signature manquante.');
    return;
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error(' Erreur de signature Webhook :', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      try {
        const booking = await Booking.findByIdAndUpdate(bookingId, { statut: BookingStatus.CONFIRMED });
        console.log(`Réservation ${bookingId} confirmée suite au paiement.`);
        if (!booking) {
          console.error(`Réservation introuvable pour l'id : ${bookingId}`);
          return;
        }
        const pdfUrl = await generateInvoicePDF(booking);
        console.log(`Facture générée : ${pdfUrl}`);
      
        
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la réservation :', error);
      }
    }
  }
  res.status(200).json({ received: true });
};