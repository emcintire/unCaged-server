import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';
import type { CreateMovieDto } from './createMovieDto';

export type CreateMovieRequest = AuthenticatedRequest<CreateMovieDto>;
