import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  avatar: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  token_hash_check: z.string().optional(),
});

const updateSchema = createSchema.partial();

export class UserCreatePayload extends createZodDto(createSchema) {}
export class UserUpdatePayload extends createZodDto(updateSchema) {}
