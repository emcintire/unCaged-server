import type { Request } from 'express';

export type GetMovieByIdRequest = Request<{ id: string }>;
