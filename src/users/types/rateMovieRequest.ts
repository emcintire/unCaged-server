import type { AuthenticatedRequest } from '@/types';
import type { RateMovieDto } from './rateMovieDto';

export type RateMovieRequest = AuthenticatedRequest<RateMovieDto>;
