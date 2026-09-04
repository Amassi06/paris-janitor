import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI n'est pas définie dans les variables d'environnement (.env)");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connecté avec succès : ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB :', error);
    process.exit(1); // Arrête le processus en cas d'échec de connexion
  }
};