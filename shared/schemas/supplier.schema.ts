import { z } from 'zod';
import { preprocessJson } from '../utils/zod.utils';

export const supplierStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  address: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  store_id: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
})

export const SupplierSchema = z.object({
  id: z.string(),
  user: z.string().optional(), // ObjectId as string
  name: z.string().min(1, 'Name is required'),
  stores: preprocessJson(z.array(
    supplierStoreSchema
  ).optional()),
  logo: z.string().optional(),
  description: z.string().optional(),
  cardTypes: preprocessJson(z.array(z.string()).default(['digital', 'physical'])),
  fromColor: z.string().min(1, 'From color is required'),
  toColor: z.string().min(1, 'To color is required'),
});

export const CreateSupplierSchema = SupplierSchema.omit({
  id: true,
  user: true,
  logo: true,
})

export const UpdateSupplierSchema = SupplierSchema.omit({
  id: true,
  user: true,
  logo: true,
})
