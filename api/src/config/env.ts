import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paris-janitor',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  API_URL:process.env.API_URL || 'http://localhost:3000'
};