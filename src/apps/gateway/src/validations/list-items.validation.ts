import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const createListItemSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  check: z.boolean().optional().default(false),
  interval: z.number().int().positive().optional(),
});

const updateListItemSchema = createListItemSchema.partial();

export class CreateListItemPayload extends createZodDto(createListItemSchema) {}
export class UpdateListItemPayload extends createZodDto(updateListItemSchema) {}
