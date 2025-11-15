import type { AuthenticatedRequest } from '@/types';
import type { FilteredMoviesDto } from './filteredMoviesDto';

export type FilteredMoviesRequest = AuthenticatedRequest<FilteredMoviesDto>;
