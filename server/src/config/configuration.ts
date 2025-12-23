import { z } from 'zod';

export enum NODE_ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export const configurationSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV).default(NODE_ENV.DEVELOPMENT),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string().default('secret'),
  JWT_SECRET_REFRESH: z.string().default('secretRefresh'),
  PORT: z.coerce.number().default(3000),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_BASE_FOLDER: z.string().default('gift-cards'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  EMAIL_USERNAME: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_ADDRESS: z.string(),
  EMAIL_SERVICE: z.string(),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ADMIN_EMAIL: z.string().optional(),
  ENABLE_ADMIN_EMAILS: z
    .string()
    .transform((val) => val === 'true')
    .default(false),
});

export type Configuration = z.infer<typeof configurationSchema>;

export default () => {
  const result = configurationSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(result.error.format(), null, 2),
    );
    throw new Error('Invalid environment variables');
  }

  return result.data;
};
