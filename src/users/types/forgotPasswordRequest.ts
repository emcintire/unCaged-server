import type { Request } from 'express';
import type { ForgotPasswordDto } from './forgotPasswordDto';

export type ForgotPasswordRequest = Request<unknown, unknown, ForgotPasswordDto>;
