import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';
import type { UpdateMovieDto } from './updateMovieDto';

export type UpdateMovieRequest = AuthenticatedRequest<UpdateMovieDto, { id: string }>;
