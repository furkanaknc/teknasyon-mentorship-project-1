import { z } from 'zod';

export const envSchema = z.object({
  LIST_PORT: z.coerce.number().default(3002),

  DATABASE_URL: z.string(),
});

export type EnvVariables = z.infer<typeof envSchema>;
