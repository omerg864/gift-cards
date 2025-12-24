import { z } from 'zod';
import { preprocessJson } from '../utils/zod.utils';
import { DeviceSchema } from './device.schema';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  image: z.string().nullable().optional(),
  isVerified: z.boolean().default(false),
  verificationToken: z.string().optional(),
  resetPasswordTokenExpiry: z.date().optional(),
  admin: z.boolean().default(false),
  salt: z.string().optional(),
  verifyToken: z.string().optional(),
  tokens: z.array(
    z.object({
      token: z.string(),
      device_id: z.string(),
      createdAt: z.date().default(() => new Date()),
      name: z.string(),
      type: z.string(),
      unique: z.string(),
    })
  ).optional(),
});

export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  device: DeviceSchema,
});

export const UpdateUserSchema = preprocessJson(UserSchema.pick({
  name: true,
  email: true,
  image: true,
}).partial());

export const UpdateEncryptionKeySchema = UserSchema.pick({
  salt: true,
  verifyToken: true,
}).required();

export const ResetEncryptionKeySchema = z.object({
  password: z.string(),
});
