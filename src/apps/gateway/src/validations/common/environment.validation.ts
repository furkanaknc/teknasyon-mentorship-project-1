import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  LIST_SERVICE_URL: z.string().default('http://localhost:3002'),
  PROFILE_SERVICE_URL: z.string().default('http://localhost:3003'),
});

export type EnvVariables = z.infer<typeof envSchema>;
