export interface ReservationDTO {
  _id: string;
  id_voyageur: {
    _id: string;
    email: string;
  } | null;
  id_service: {
    _id: string;
    nom: string;
    prix_base: number;
  } | null;
  date_prestation: string;
  statut: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  prix_final: number;
  note?: number;
  commentaire?: string;
}