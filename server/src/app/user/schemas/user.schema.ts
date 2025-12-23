import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '@shared/types/user.types';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true, collection: 'users' })
export class UserModel implements Omit<User, 'id'> {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  image?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordTokenExpiry?: Date;

  @Prop({ default: false })
  admin: boolean;

  @Prop()
  salt?: string;

  @Prop()
  verifyToken?: string;

  @Prop([
    {
      token: { type: String, required: true },
      device_id: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      name: { type: String, required: true },
      type: { type: String, required: true },
      unique: { type: String, required: true },
    },
  ])
  tokens?: {
    token: string;
    device_id: string;
    createdAt: Date;
    name: string;
    type: string;
    unique: string;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    delete ret._id;
    delete ret.password;
    delete ret.tokens;
    delete ret.verificationToken;
    delete ret.resetPasswordTokenExpiry;
  },
});
