import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  nom: string;
  description: string;
  prix_base: number;
  actif: boolean;
  vip_only: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    prix_base: {
      type: Number,
      required: true,
      min: 0,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    vip_only: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>('Service', serviceSchema);