import type { AuthenticatedRequest } from '@/types';
import type { UpdateMovieDto } from './updateMovieDto';

export type UpdateMovieRequest = AuthenticatedRequest<UpdateMovieDto, { id: string }>;
