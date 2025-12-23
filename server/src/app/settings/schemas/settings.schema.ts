import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { Settings } from '@shared/types/settings.types';

export type SettingsDocument = HydratedDocument<SettingsModel>;

@Schema({ timestamps: true, collection: 'settings' })
export class SettingsModel implements Settings {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ default: true })
  email1MonthNotification: boolean;

  @Prop({ default: true })
  email2MonthNotification: boolean;

  @Prop({ default: true })
  emailOnNewDevice: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(SettingsModel);
