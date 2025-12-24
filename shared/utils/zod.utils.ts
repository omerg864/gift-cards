import { z } from 'zod';

export const preprocessJson = <T extends z.ZodTypeAny>(schema: T) => {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }, schema);
};
