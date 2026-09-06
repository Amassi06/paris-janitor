export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
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