import type { AuthenticatedRequest } from '../../users/types/authenticatedRequest';
import type { CreateQuoteDto } from './createQuoteDto';

export type CreateQuoteRequest = AuthenticatedRequest<CreateQuoteDto>;
