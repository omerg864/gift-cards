import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../../lib/cloudinary/cloudinary.module';
import { CardModule } from '../card/card.module';
import { UserModel, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    CardModule,
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
