import type { Request } from 'express';

export type FindByTitleParamRequest = Request<{ title: string }>;
