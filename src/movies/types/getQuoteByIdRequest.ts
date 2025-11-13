import type { Request } from 'express';

export type GetQuoteByIdRequest = Request<{ id: string }>;
