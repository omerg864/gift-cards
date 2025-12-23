import { z } from 'zod';
import { SupplierSchema, CreateSupplierSchema, UpdateSupplierSchema, supplierStoreSchema } from '../schemas/supplier.schema';

export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierStore = z.infer<typeof supplierStoreSchema>;
export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;
