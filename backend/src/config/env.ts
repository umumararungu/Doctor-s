import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  throw new Error('Missing env variables');
}

export const env = {
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 5000,
};
