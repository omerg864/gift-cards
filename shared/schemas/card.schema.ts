import { z } from 'zod';
import { CreateSupplierSchema } from './supplier.schema';

export const CardSchema = z.object({
  id: z.string(),
  user: z.string(), // ObjectId as string
  name: z.string().min(1, 'Name is required'),
  supplier: z.string(), // ObjectId as string
  description: z.string().optional(),
  isPhysical: z.boolean().default(false),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(), // Date strings from date inputs
  last4: z.string().optional(),
  cvv: z.string().optional(),
  notified1Month: z.boolean().default(false),
  notified2Month: z.boolean().default(false),
});

export const CreateCardSchema = z.object({ card: CardSchema.omit({
  id: true,
  user: true,
  notified1Month: true,
  notified2Month: true,
  supplier: true,
}).extend({
  supplier: z.string().optional().nullable(),
}), supplier: CreateSupplierSchema.optional().nullable()})

export const UpdateCardSchema = z.object({ card: CardSchema.omit({
  id: true,
  user: true,
  notified1Month: true,
  notified2Month: true,
  supplier: true,
}).extend({
  supplier: z.string().optional().nullable(),
}), supplier: CreateSupplierSchema.optional().nullable()})
