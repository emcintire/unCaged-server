import type { Request } from 'express';
import type { GetMoviesDto } from './getMoviesDto';

export type GetMoviesRequest = Request<unknown, unknown, GetMoviesDto>;
