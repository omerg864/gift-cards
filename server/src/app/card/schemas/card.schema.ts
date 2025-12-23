import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { Card } from '@shared/types/card.types';

export type CardDocument = HydratedDocument<CardModel>;

@Schema({ timestamps: true, collection: 'cards' })
export class CardModel implements Omit<Card, 'id'> {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplier: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isPhysical: boolean;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop()
  cardNumber?: string;

  @Prop()
  expiry?: string;

  @Prop()
  last4?: string;

  @Prop()
  cvv?: string;

  @Prop({ default: false })
  notified1Month: boolean;

  @Prop({ default: false })
  notified2Month: boolean;
}

export const CardSchema = SchemaFactory.createForClass(CardModel);

CardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    delete ret._id;
  },
});
