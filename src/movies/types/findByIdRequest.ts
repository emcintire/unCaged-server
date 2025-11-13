import type { Request } from 'express';

export type FindByIdRequest = Request<{ id: string }>;
