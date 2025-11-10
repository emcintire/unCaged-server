import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

export function admin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Response {
  if (!req.user?.isAdmin)
    return res.status(401).send("Ah ah ah! You didn't say the magic word!");
  next();
}
