import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const createListSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  color: z.string().optional(),
  slug: z.string().min(1),
  edit_allowed_user: z.array(z.string()).optional().default([]),
});

const updateListSchema = createListSchema.partial();

export class createListPayload extends createZodDto(createListSchema) {}
export class updateListPayload extends createZodDto(updateListSchema) {}
