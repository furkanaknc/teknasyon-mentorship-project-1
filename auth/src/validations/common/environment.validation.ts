import { z } from 'zod';

export const envSchema = z.object({
  AUTH_PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string(),
});

export type EnvVariables = z.infer<typeof envSchema>;
