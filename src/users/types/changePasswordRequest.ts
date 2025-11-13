import type { AuthenticatedRequest } from './authenticatedRequest';
import type { ChangePasswordDto } from './changePasswordDto';

export type ChangePasswordRequest = AuthenticatedRequest<ChangePasswordDto>;
