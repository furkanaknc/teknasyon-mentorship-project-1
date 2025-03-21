import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const listItemIdValidation = z.object({
  listItemId: z.string(),
});

const listIdValidation = z.object({
  listId: z.string(),
});

export class ListItemsIdParam extends createZodDto(listItemIdValidation) {}
export class ListIdParam extends createZodDto(listIdValidation) {}
