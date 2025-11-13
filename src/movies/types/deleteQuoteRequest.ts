import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';

export type DeleteQuoteRequest = AuthenticatedRequest<unknown, { id: string }>;
