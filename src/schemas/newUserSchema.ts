import { z } from 'zod';
import { passwordRegex, passwordMessage } from '@/util';

export const newUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().min(1).max(100),
  password: z.string().regex(passwordRegex, passwordMessage),
});
