import type { Request } from 'express';
import type { RegisterUserDto } from './registerUserDto';

export type RegisterUserRequest = Request<unknown, unknown, RegisterUserDto>;
