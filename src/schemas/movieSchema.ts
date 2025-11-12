import { z } from 'zod';
import { movieRatingSchema } from './movieRatingSchema';
import type { Document } from 'mongoose';

export const movieSchema = z.object({
  avgRating: z.number().min(0).max(10).optional(),
  title: z.string().min(1).max(100),
  director: z.string().min(1).max(100),
  description: z.string().max(512).optional(),
  date: z.string().min(1).max(100),
  runtime: z.string().min(1).max(100),
  rating: z.string().min(1).max(100),
  ratings: z.array(movieRatingSchema).default([]),
  img: z.string().max(100).optional(),
  genres: z.array(z.string()).optional().default([]),
});

export type Movie = z.infer<typeof movieSchema> & Document;
