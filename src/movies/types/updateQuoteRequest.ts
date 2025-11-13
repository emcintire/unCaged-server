import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';
import type { UpdateQuoteDto } from './updateQuoteDto';

export type UpdateQuoteRequest = AuthenticatedRequest<UpdateQuoteDto, { id: string }>;
