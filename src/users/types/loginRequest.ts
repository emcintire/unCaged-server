import type { Request } from 'express';
import type { LoginDto } from './loginDto';

export type LoginRequest = Request<unknown, unknown, LoginDto>;
