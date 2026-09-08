export interface InvoiceDTO {
  _id: string;
  numero_facture: string;
  montant: number;
  createdAt: string;
  id_booking: {
    _id: string;
    date_prestation: string;
    statut: string;
    id_voyageur: { _id: string; email: string } | null;
    id_service: { _id: string; nom: string } | null;
  } | null;
}
