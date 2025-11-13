import type { Request } from 'express';
import type { CheckCodeDto } from './checkCodeDto';

export type CheckCodeRequest = Request<unknown, unknown, CheckCodeDto>;
