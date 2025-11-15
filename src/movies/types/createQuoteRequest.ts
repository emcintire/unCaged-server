import type { AuthenticatedRequest } from '@/types';
import type { CreateQuoteDto } from './createQuoteDto';

export type CreateQuoteRequest = AuthenticatedRequest<CreateQuoteDto>;
