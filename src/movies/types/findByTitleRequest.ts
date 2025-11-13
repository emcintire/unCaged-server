import type { Request } from 'express';
import type { FindByTitleDto } from './findByTitleDto';

export type FindByTitleRequest = Request<unknown, unknown, FindByTitleDto>;
