export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface IBooking {
  _id: string;
  id_voyageur: string;
  id_service: string;
  date_prestation: string;
  statut: BookingStatus;
  prix_final: number;
  note?: number;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
}
export interface IService {
  _id: string;
  nom: string;
  description: string;
  prix_base: number;
}