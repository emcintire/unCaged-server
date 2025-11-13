import type { AuthenticatedRequest } from './authenticatedRequest';
import type { FilteredMoviesDto } from './filteredMoviesDto';

export type FilteredMoviesRequest = AuthenticatedRequest<FilteredMoviesDto>;
