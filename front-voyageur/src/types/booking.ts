export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};


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