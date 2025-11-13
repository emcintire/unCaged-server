import type { AuthenticatedRequest } from './authenticatedRequest';
import type { MovieActionDto } from './movieActionDto';

export type MovieActionRequest = AuthenticatedRequest<MovieActionDto>;
