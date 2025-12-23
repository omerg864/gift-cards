
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { SupplierModel } from '../src/app/supplier/schemas/supplier.schema';
import { UserModel } from '../src/app/user/schemas/user.schema';

const logger = new Logger('CloudinaryMigration');
const DRY_RUN = false;

const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const regex = /\/v\d+\/(.+)\.\w+$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

async function migrate() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const supplierModel = app.get<Model<SupplierModel>>(getModelToken(SupplierModel.name));
  const userModel = app.get<Model<UserModel>>(getModelToken(UserModel.name));

  logger.log(`Starting migration... DRY_RUN: ${DRY_RUN}`);

  // Migrate Suppliers
  const suppliers = await supplierModel.find({}).exec();
  logger.log(`Found ${suppliers.length} suppliers`);

  for (const supplier of suppliers) {
    let modified = false;

    // Migrate logo
    if (supplier.logo) {
      const publicId = extractPublicId(supplier.logo);
      if (publicId && publicId !== supplier.logo) {
        logger.log(`[Supplier] ${supplier.name} Logo: ${supplier.logo} -> ${publicId}`);
        supplier.logo = publicId;
        modified = true;
      }
    }

    // Migrate store images
    if (supplier.stores && Array.isArray(supplier.stores)) {
      for (const store of supplier.stores) {
        if (store.image) {
          const publicId = extractPublicId(store.image);
          if (publicId && publicId !== store.image) {
            logger.log(`[Supplier] ${supplier.name} Store ${store.name || 'Unknown'} Image: ${store.image} -> ${publicId}`);
            store.image = publicId;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      if (!DRY_RUN) {
        await supplier.save();
        logger.log(`Migrated supplier ${supplier.name}`);
      } else {
        logger.log(`[DRY RUN] Would save supplier ${supplier.name}`);
      }
    }
  }

  // Migrate Users
  const users = await userModel.find({}).exec();
  logger.log(`Found ${users.length} users`);

  for (const user of users) {
    let modified = false;

    if (user.image) {
      const publicId = extractPublicId(user.image);
      if (publicId && publicId !== user.image) {
        logger.log(`[User] ${user.email} Image: ${user.image} -> ${publicId}`);
        user.image = publicId;
        modified = true;
      }
    }

    if (modified) {
      if (!DRY_RUN) {
        await user.save();
        logger.log(`Migrated user ${user.email}`);
      } else {
        logger.log(`[DRY RUN] Would save user ${user.email}`);
      }
    }
  }

  logger.log('Migration complete');
  await app.close();
}

migrate();
