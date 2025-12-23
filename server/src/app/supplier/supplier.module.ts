import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../../lib/cloudinary/cloudinary.module';
import { SupplierModel, SupplierSchema } from './schemas/supplier.schema';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplierModel.name, schema: SupplierSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
