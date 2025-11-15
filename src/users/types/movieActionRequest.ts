import type { AuthenticatedRequest } from '@/types';
import type { MovieActionDto } from './movieActionDto';

export type MovieActionRequest = AuthenticatedRequest<MovieActionDto>;
