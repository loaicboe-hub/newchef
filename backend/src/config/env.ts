import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/chef_fergany',
  JWT_SECRET: process.env.JWT_SECRET || 'chef_fergany_super_secret_jwt_key_2026_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://newchef-azure.vercel.app',
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};
