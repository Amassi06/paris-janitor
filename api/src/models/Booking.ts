import mongoose, { Document, Schema, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IBooking extends Document {
  id_voyageur: Types.ObjectId;
  id_service: Types.ObjectId;
  date_prestation: Date;
  statut: BookingStatus;
  prix_final: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    id_voyageur: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    id_service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date_prestation: {
      type: Date,
      required: true,
    },
    statut: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    prix_final: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);