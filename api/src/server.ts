import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes)
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments',paymentRoutes);
const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve('./src/swagger/swagger-output.json'), 'utf-8')
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

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
      console.log('Swagger dispo sur http://localhost:3000/api-docs');
    });
  } catch (error) {
    console.error('Erreur au lancement du serveur :', error);
    process.exit(1);
  }
};

startServer();