import { z } from 'zod';

export const envSchema = z.object({
  PROFILE_PORT: z.coerce.number().default(3003),

  DATABASE_URL: z.string(),
});

export type EnvVariables = z.infer<typeof envSchema>;
