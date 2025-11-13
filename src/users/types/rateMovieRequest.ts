import type { AuthenticatedRequest } from './authenticatedRequest';
import type { RateMovieDto } from './rateMovieDto';

export type RateMovieRequest = AuthenticatedRequest<RateMovieDto>;
