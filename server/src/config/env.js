import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const required = (k) => { if (!process.env[k]) throw new Error(`Missing required environment variable ${k}. Copy .env.example to .env.`); return process.env[k]; };
export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads'),
  tempTeamPassword: () => required('TEMP_TEAM_PASSWORD'),
};
