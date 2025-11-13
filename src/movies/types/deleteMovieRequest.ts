import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';

export type DeleteMovieRequest = AuthenticatedRequest<unknown, { id: string }>;
