import { z } from 'zod';
import { passwordRegex } from '../util/passwordRegex';
import { passwordMessage } from '../util/passwordMessage';

export const newUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().min(1).max(100),
  password: z.string().regex(passwordRegex, passwordMessage),
});
