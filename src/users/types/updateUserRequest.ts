import type { AuthenticatedRequest } from './authenticatedRequest';
import type { UpdateUserDto } from './updateUserDto';

export type UpdateUserRequest = AuthenticatedRequest<UpdateUserDto>;
