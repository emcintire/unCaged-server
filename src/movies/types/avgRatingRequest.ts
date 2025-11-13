import type { Request } from 'express';

export type AvgRatingRequest = Request<{ id: string }>;
