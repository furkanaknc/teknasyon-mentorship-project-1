import { z } from 'zod';

export const envSchema = z.object({
  PROFILE_PORT: z.coerce.number().default(3003),

  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type EnvVariables = z.infer<typeof envSchema>;
