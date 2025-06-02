import { z } from 'zod';

export const envSchema = z.object({
  AUTH_PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
});

export type EnvVariables = z.infer<typeof envSchema>;
