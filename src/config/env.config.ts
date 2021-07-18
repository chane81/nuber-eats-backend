import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  PORT: +process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || '',
  DB_PORT: process.env.DB_PORT || '',
  DB_USERNAME: process.env.DB_USERNAME || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || '',
  PRIATE_KEY: process.env.PRIATE_KEY || '',
  NODEMAILER_USER: process.env.NODEMAILER_USER || '',
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD || '',
  NODEMAILER_FROM_EMAIL: process.env.NODEMAILER_FROM_EMAIL || '',
  AWS_S3_ACCKEY: process.env.AWS_S3_ACCKEY || '',
  AWS_S3_SECRET: process.env.AWS_S3_SECRET || '',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || '',
}));
