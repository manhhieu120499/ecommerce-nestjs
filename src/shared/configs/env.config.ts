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
  ACCESS_TOKEN_EXPIRED: z.string({ error: 'ACCESS_TOKEN_EXIPRED is string' }),
  REFRESH_TOKEN_SECRET: z.string({ error: 'REFRESH_TOKEN_SECRET is string' }),
  REFRESH_TOKEN_EXPIRED: z.string({
    error: 'REFRESH_TOKEN_EXIPRED is string',
  }),
});

export type ConfigEnvType = z.infer<typeof ConfigSchema>;

const configServer: ConfigEnvType = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  ACCESS_TOKEN_EXPIRED: process.env.ACCESS_TOKEN_EXPIRED!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  REFRESH_TOKEN_EXPIRED: process.env.REFRESH_TOKEN_EXPIRED!,
};

const isValidEnv = ConfigSchema.safeParse(configServer);

if (!isValidEnv.success) {
  const formatMessageError = isValidEnv.error.issues.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));
  console.log('env variable invalid:\n', formatMessageError);
}

export const envConfig = configServer;
