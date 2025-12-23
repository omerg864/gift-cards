import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.string().min(1, 'Device ID is required'),
  name: z.string().min(1, 'Device name is required'),
  type: z.string().min(1, 'Device type is required'),
});
