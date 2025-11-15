import type { AuthenticatedRequest } from '@/types';
import type { CreateMovieDto } from './createMovieDto';

export type CreateMovieRequest = AuthenticatedRequest<CreateMovieDto>;
