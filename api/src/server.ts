import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

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