import mongoose from 'mongoose';
import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  VOYAGEUR = 'VOYAGEUR',
}

export enum SubscriptionInterval {
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum SubscriptionType {
  FREE = 'FREE',
  BAG_PACKER = 'BAG_PACKER',
  EXPLORATOR = 'EXPLORATOR',
}

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: UserRole;
  subscription: SubscriptionType;
  banned: boolean;
  subscription_interval?: SubscriptionInterval;
  subscription_end?: Date;
  renewal_count: number;
  free_services: { id_booking: mongoose.Types.ObjectId; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VOYAGEUR,
    },
    subscription: {
      type: String,
      enum: Object.values(SubscriptionType),
      default: SubscriptionType.FREE,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    subscription_interval: {
      type: String,
      enum: Object.values(SubscriptionInterval),
      required: false,
    },
    subscription_end: {
      type: Date,
      required: false,
    },
    renewal_count: {
      type: Number,
      default: 0,
    },
    free_services: [
      {
        id_booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);