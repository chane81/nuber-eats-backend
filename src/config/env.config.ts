import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  PRIATE_KEY: process.env.PRIATE_KEY,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  NODEMAILER_FROM_EMAIL: process.env.NODEMAILER_FROM_EMAIL,
}));
