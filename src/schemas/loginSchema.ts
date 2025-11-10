import z from 'zod';
import { passwordRegex } from '../util/passwordRegex';

export const loginSchema = z.object({
  email: z.email().min(1).max(100),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 digit'),
});
