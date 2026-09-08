import { IUser, SubscriptionType } from '../models/User.js';
import { IService } from '../models/Service.js';

const MOIS_ENTRE_DEUX_OFFRES: Partial<Record<SubscriptionType, number>> = {
  [SubscriptionType.BAG_PACKER]: 12,
  [SubscriptionType.EXPLORATOR]: 6,
};

const PLAFOND_OFFRE: Partial<Record<SubscriptionType, number>> = {
  [SubscriptionType.BAG_PACKER]: 80,
  [SubscriptionType.EXPLORATOR]: Infinity,
};

export const REDUCTION_EXPLORATOR = 0.05;

export interface PrixCalcule {
  prix_final: number;
  reduction: number;
  offerte: boolean;
}

const dateIlYA = (mois: number): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() - mois);
  return date;
};


export const offreDisponible = (user: IUser): boolean => {
  const mois = MOIS_ENTRE_DEUX_OFFRES[user.subscription];
  if (!mois) return false;

  const debutFenetre = dateIlYA(mois);
  const dejaUtilisee = (user.free_services || []).some(
    (offre) => new Date(offre.date) > debutFenetre
  );

  return !dejaUtilisee;
};

export const computeBookingPrice = (user: IUser, service: IService): PrixCalcule => {
  const prixBase = service.prix_base;
  const plafond = PLAFOND_OFFRE[user.subscription] ?? 0;

  if (offreDisponible(user) && prixBase <= plafond) {
    return { prix_final: 0, reduction: prixBase, offerte: true };
  }

  if (user.subscription === SubscriptionType.EXPLORATOR) {
    const prix = Math.round(prixBase * (1 - REDUCTION_EXPLORATOR) * 100) / 100;
    return { prix_final: prix, reduction: prixBase - prix, offerte: false };
  }

  return { prix_final: prixBase, reduction: 0, offerte: false };
};
