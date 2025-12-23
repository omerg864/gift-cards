import { z } from 'zod';
import { SettingsSchema, CreateSettingsSchema, UpdateSettingsSchema } from '../schemas/settings.schema';

export type Settings = z.infer<typeof SettingsSchema>;
export type CreateSettingsDto = z.infer<typeof CreateSettingsSchema>;
export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;
