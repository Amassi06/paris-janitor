import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    await connectDB();
    console.log('Connexion réussie, lancement du serveur...');
    app.listen(ENV.PORT, () => {
      console.log(`Serveur démarré sur ${ENV.CLIENT_URL}`);
      console.log(`Swagger dispo sur ${ENV.API_URL}/api-docs`);
    });
  } catch (error) {
    console.error('Erreur au lancement du serveur :', error);
    process.exit(1);
  }
};

startServer();
