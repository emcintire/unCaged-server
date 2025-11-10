import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

export function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Response {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided...');

  try {
    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
    if (!jwtPrivateKey) {
      throw new Error('JWT_PRIVATE_KEY is not defined');
    }
    const decoded = jwt.verify(token, jwtPrivateKey) as {
      _id: string;
      isAdmin: boolean;
    };
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token...');
  }
}
