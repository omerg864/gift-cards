import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierModule } from '../supplier/supplier.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardModel, CardSchema } from './schemas/card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CardModel.name, schema: CardSchema }]),
    SupplierModule,
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [MongooseModule, CardService],
})
export class CardModule {}
