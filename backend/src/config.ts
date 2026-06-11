import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET ist nicht gesetzt. Bitte die Umgebungsvariable JWT_SECRET konfigurieren (siehe .env.example).'
  );
}

export const JWT_SECRET: string = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
