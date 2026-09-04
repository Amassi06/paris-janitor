import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInvoice extends Document {
  id_booking: Types.ObjectId;
  montant: number;
  url_pdf: string;
  numero_facture: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    id_booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    montant: {
      type: Number,
      required: true,
      min: 0,
    },
    url_pdf: {
      type: String,
      required: true,
    },
    numero_facture: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);