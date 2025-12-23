import { z } from 'zod';

export const SettingsSchema = z.object({
  user: z.string(), // ObjectId as string
  email1MonthNotification: z.boolean().default(true),
  email2MonthNotification: z.boolean().default(true),
  emailOnNewDevice: z.boolean().default(true),
});

export const CreateSettingsSchema = SettingsSchema.omit({
  user: true,
});

export const UpdateSettingsSchema = SettingsSchema.omit({
  user: true,
}).partial();
