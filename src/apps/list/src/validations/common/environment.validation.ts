import { z } from 'zod';

export const envSchema = z.object({
  LIST_PORT: z.coerce.number().default(3002),

  DATABASE_URL: z.string(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  JWT_ACCESS_SECRET: z.string().min(1),
  AUTH_SERVICE_URL: z.string().min(1),
});

export type EnvVariables = z.infer<typeof envSchema>;
