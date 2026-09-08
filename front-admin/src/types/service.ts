export interface ServiceDTO {
  _id: string;
  nom: string;
  description: string;
  prix_base: number;
  actif: boolean;
  vip_only: boolean;
}