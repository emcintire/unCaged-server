import type { Request } from 'express';

export type AuthRequest = Request & {
  user?: {
    _id: string;
    isAdmin: boolean;
  };
};
