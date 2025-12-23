import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { Supplier } from '@shared/types/supplier.types';

export type SupplierDocument = HydratedDocument<SupplierModel>;

@Schema({ timestamps: true, collection: 'suppliers' })
export class SupplierModel implements Omit<Supplier, 'id'> {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  user?: string;

  @Prop({ required: true })
  name: string;

  @Prop([
    {
      name: { type: String, required: true },
      address: String,
      image: String,
      description: String,
      store_id: String,
      website: String,
      phone: String,
    },
  ])
  stores: {
    name: string;
    address?: string;
    image?: string;
    description?: string;
    store_id?: string;
    website?: string;
    phone?: string;
  }[];

  @Prop()
  logo?: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: ['digital', 'physical'] })
  cardTypes: string[];

  @Prop({ required: true })
  fromColor: string;

  @Prop({ required: true })
  toColor: string;
}

export const SupplierSchema = SchemaFactory.createForClass(SupplierModel);

SupplierSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    delete ret._id;
  },
});
