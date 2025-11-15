import type { AuthenticatedRequest } from '@/types';
import type { UpdateQuoteDto } from './updateQuoteDto';

export type UpdateQuoteRequest = AuthenticatedRequest<UpdateQuoteDto, { id: string }>;
