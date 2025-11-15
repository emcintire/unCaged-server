import type { AuthenticatedRequest } from '@/types';

export type DeleteQuoteRequest = AuthenticatedRequest<unknown, { id: string }>;
