import type { AuthenticatedRequest } from '@/types';
import type { UpdateUserDto } from './updateUserDto';

export type UpdateUserRequest = AuthenticatedRequest<UpdateUserDto>;
