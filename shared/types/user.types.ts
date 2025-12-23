import { z } from 'zod';
import { UserSchema, CreateUserSchema, LoginUserSchema } from '../schemas/user.schema';

export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;
