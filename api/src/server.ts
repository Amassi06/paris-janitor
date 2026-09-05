import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes)
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
// Route test
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API opérationnelle' });
});

const startServer = async () => {
 try {
    console.log('Tentative de connexion à MongoDB...');
    await connectDB();
    console.log('Connexion réussie, lancement du serveur...');

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur au lancement du serveur :', error);
    process.exit(1);
  }
};

startServer();