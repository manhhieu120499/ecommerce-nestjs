import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import 'dotenv/config';

const envPath = '.env';

if (!fs.existsSync(path.resolve(envPath))) {
  throw new Error('File .env config not found');
}

const ConfigSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string({ error: 'ACCESS_TOKEN_SECRET is string' }),
  ACCESS_TOKEN_EXPIRED: z.string({ error: 'ACCESS_TOKEN_EXPIRED is string' }),
  REFRESH_TOKEN_SECRET: z.string({ error: 'REFRESH_TOKEN_SECRET is string' }),
  REFRESH_TOKEN_EXPIRED: z.string({
    error: 'REFRESH_TOKEN_EXPIRED is string',
  }),
  SECRET_KEY_API: z.string({ error: 'SECRET_KEY_API is string' }).default(''),
  OTP_EXPIRED_IN: z.string({ error: 'OTP_EXPIRED_IN is string' }),
  RESEND_API_KEY: z.string({ error: 'RESEND_API_KEY is string' }),
});

export type ConfigEnvType = z.infer<typeof ConfigSchema>;

const configServer: ConfigEnvType = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  ACCESS_TOKEN_EXPIRED: process.env.ACCESS_TOKEN_EXPIRED!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  REFRESH_TOKEN_EXPIRED: process.env.REFRESH_TOKEN_EXPIRED!,
  SECRET_KEY_API: process.env.SECRET_KEY_API!,
  OTP_EXPIRED_IN: process.env.OTP_EXPIRED_IN!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
};

const isValidEnv = ConfigSchema.safeParse(configServer);

if (!isValidEnv.success) {
  const formatMessageError = isValidEnv.error.issues.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));
  console.log('env variable invalid:\n', formatMessageError);
  process.exit(1);
}

export const envConfig = configServer;
