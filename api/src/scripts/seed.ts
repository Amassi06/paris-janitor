import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, UserRole, SubscriptionType } from '../models/User.js';
import { Service } from '../models/Service.js';

const MONGO_URI = process.env.MONGO_URI;
const SEED_PASSWORD = 'Password123';

const USERS = [
  { email: 'admin@paris-janitor.fr', role: UserRole.ADMIN, subscription: SubscriptionType.FREE },
  { email: 'voyageur@paris-janitor.fr', role: UserRole.VOYAGEUR, subscription: SubscriptionType.FREE },
];

const SERVICES = [
  {
    nom: 'Check-in / check-out',
    description: "Accueil et remise des clés au voyageur, à l'arrivée comme au départ.",
    prix_base: 30,
    vip_only: false,
  },
  {
    nom: 'Ménage complet',
    description: 'Nettoyage complet du logement entre deux locations.',
    prix_base: 45,
    vip_only: false,
  },
  {
    nom: 'Transport aéroport',
    description: "Prise en charge et transport du voyageur vers l'aéroport.",
    prix_base: 60,
    vip_only: false,
  },
  {
    nom: 'Conciergerie VIP 24/7',
    description: 'Assistance prioritaire et personnalisée à toute heure, réservée aux abonnés Explorator.',
    prix_base: 90,
    vip_only: true,
  },
  {
    nom: 'Accès prioritaire événements',
    description: 'Réservation prioritaire de prestations et places limitées, réservée aux abonnés Explorator.',
    prix_base: 120,
    vip_only: true,
  },
];

const seed = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI n'est pas définie dans les variables d'environnement (.env)");
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connecté à MongoDB, seed en cours...');

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const u of USERS) {
    const result = await User.updateOne(
      { email: u.email },
      { $setOnInsert: { ...u, password: hashedPassword } },
      { upsert: true }
    );
    console.log(
      result.upsertedCount > 0
        ? `  + utilisateur créé : ${u.email} (${u.role})`
        : `  = utilisateur déjà présent : ${u.email}`
    );
  }

  for (const s of SERVICES) {
    const result = await Service.updateOne(
      { nom: s.nom },
      { $setOnInsert: { ...s, actif: true } },
      { upsert: true }
    );
    console.log(
      result.upsertedCount > 0
        ? `  + service créé : ${s.nom}${s.vip_only ? ' [VIP]' : ''}`
        : `  = service déjà présent : ${s.nom}`
    );
  }

  console.log('\nSeed terminé.');
  console.log(`Mot de passe des comptes créés : ${SEED_PASSWORD}`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Erreur lors du seed :', error);
  process.exit(1);
});
