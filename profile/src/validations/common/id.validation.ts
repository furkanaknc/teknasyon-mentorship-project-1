import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const userIdValidation = z.object({
  userId: z.string(),
});

export class UserIdPayload extends createZodDto(userIdValidation) {}
