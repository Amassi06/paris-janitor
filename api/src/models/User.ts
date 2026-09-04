import mongoose from 'mongoose';
import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  VOYAGEUR = 'VOYAGEUR',
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
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);