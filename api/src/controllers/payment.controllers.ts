import {Request, Response} from 'express';
import Stripe from 'stripe';
import { Booking, BookingStatus} from '../models/Booking.js';
import { User, SubscriptionType,IUser } from '../models/User.js';
import { generateInvoicePDF } from '../services/invoice.service.js';

const PLANS: Record<string, { name: string; amount: number; subscriptionType: SubscriptionType }> = {
  bag_packer: {
    name: 'Abonnement Bag Packer',
    amount: 990, 
    subscriptionType: SubscriptionType.BAG_PACKER,
  },
  explorator: {
    name: 'Abonnement Explorator',
    amount: 1900, 
    subscriptionType: SubscriptionType.EXPLORATOR,
  },
};

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
    const user_ = await Booking.findById(bookingId).populate<{ id_voyageur: IUser }>('id_voyageur');
    const userEmail = user_?.id_voyageur?.email;
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
      customer_email: userEmail,
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: {
        type: 'booking',
        bookingId: booking._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session Stripe' });
  }
};

export const createSubscriptionCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Utilisateur non authentifié.' });
      return;
    }

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      res.status(400).json({ message: 'Plan inconnu.' });
      return;
    }

    const stripe = getStripe();
    const user_ = await User.findById(userId);
    const userEmail = user_?.email;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: selectedPlan.name,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'subscription',
        userId: userId.toString(),
        plan,
      },
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Erreur Checkout Abonnement:', error);
    res.status(500).json({ message: "Erreur lors de la création de l'abonnement" });
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
    console.error('Erreur de signature Webhook :', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Cas 1 : paiement d'une réservation
    if (session.metadata?.type === 'booking') {
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        try {
          const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { statut: BookingStatus.CONFIRMED },
            { new: true }
          );
          if (!booking) {
            console.error(`Réservation introuvable pour l'id : ${bookingId}`);
          } else {
            const pdfUrl = await generateInvoicePDF(booking);
            console.log(`Réservation ${bookingId} confirmée suite au paiement.`);
            console.log(`Facture générée : ${pdfUrl}`);
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la réservation :', error);
        }
      }
    }

    // Cas 2 : paiement d'un abonnement
    if (session.metadata?.type === 'subscription') {
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const selectedPlan = plan ? PLANS[plan] : undefined;

      if (userId && selectedPlan) {
        try {
          await User.findByIdAndUpdate(userId, { subscription: selectedPlan.subscriptionType });
          console.log(`Abonnement ${plan} activé pour l'utilisateur ${userId}.`);
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'abonnement :", error);
        }
      }
    }
  }

  res.status(200).json({ received: true });
};