import { z } from 'zod';

export const gatewayEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(16),

  CORS_ORIGIN: z.string().optional(),

  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  LIST_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  PROFILE_SERVICE_URL: z.string().url().default('http://localhost:3003'),

  RATE_LIMIT_TTL: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  REQUEST_TIMEOUT: z.coerce.number().default(10000),
});

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;
