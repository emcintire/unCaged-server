import type { AuthenticatedRequest } from '@/types';

export type DeleteMovieRequest = AuthenticatedRequest<unknown, { id: string }>;
