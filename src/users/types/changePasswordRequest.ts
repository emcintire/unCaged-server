import type { AuthenticatedRequest } from '@/types';
import type { ChangePasswordDto } from './changePasswordDto';

export type ChangePasswordRequest = AuthenticatedRequest<ChangePasswordDto>;
