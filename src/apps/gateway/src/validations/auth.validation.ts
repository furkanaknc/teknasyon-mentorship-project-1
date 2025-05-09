import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// Common ID schema
export const IdSchema = z.object({
  id: z.string().uuid(),
});

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = LoginSchema.extend({
  username: z.string().min(3),
});

// DTOs created from schemas
export class IdDto extends createZodDto(IdSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
