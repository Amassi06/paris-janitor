import { IUser } from '../models/User.js';
//objet Request d'express ne connait pas req.user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}