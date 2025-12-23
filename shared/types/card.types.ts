import { z } from 'zod';
import { CardSchema, CreateCardSchema, UpdateCardSchema } from '../schemas/card.schema';

export type Card = z.infer<typeof CardSchema>;
export type CreateCardDto = z.infer<typeof CreateCardSchema>;
export type UpdateCardDto = z.infer<typeof UpdateCardSchema>;
