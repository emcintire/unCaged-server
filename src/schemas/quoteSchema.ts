import type { Document } from 'mongoose';
import { z } from 'zod';

export const quoteSchema = z.object({
  quote: z.string().min(1).max(255),
  subquote: z.string().min(1).max(128),
  createdOn: z.date().optional(),
});

export type Quote = z.infer<typeof quoteSchema> & Document;
