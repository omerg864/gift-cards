import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Supplier } from '../../../../shared/types/supplier.types';
import { CloudinaryService } from '../../lib/cloudinary/cloudinary.service';
import { safeJsonParse } from '../../lib/utils/json.utils';
import { UpdateSupplierDto } from './dto/supplier.dto';
import { SupplierDocument, SupplierModel } from './schemas/supplier.schema';

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(SupplierModel.name)
    private supplierModel: Model<SupplierDocument>,
    private cloudinaryService: CloudinaryService,
    private configService: ConfigService,
  ) {}

  async create(
    supplier: Omit<Supplier, 'id'>,
    files?: {
      supplier?: Express.Multer.File[];
      stores_images?: Express.Multer.File[];
    },
    userId?: string,
  ): Promise<SupplierDocument> {
    let logoUrl: string | undefined = undefined;
    const store_images: string[] = [];

    // Handle stores parsing if it's a string (from FormData)
    if (typeof supplier.stores === 'string') {
      const parsed = safeJsonParse(supplier.stores);
      if (parsed) supplier.stores = parsed;
    }

    if (files) {
      if (files.supplier && files.supplier[0]) {
        const supplierImage = files.supplier[0];
        // We don't have user id here easily without passing it, but old server used user._id in path.
        // For now I'll use a generic path or I need to pass user id to create method.
        // The controller passes CreateSupplierDto which doesn't have user id.
        // But the old server used user._id.
        // I should probably update the create method to accept userId if I want to match the path structure exactly.
        // However, the path structure is just for organization. I can use 'suppliers' folder.
        logoUrl = await this.cloudinaryService.uploadImage(
          supplierImage.buffer,
          `${this.configService.get<string>('CLOUDINARY_BASE_FOLDER')}/suppliers`,
          uuid(),
        );
      }

      if (files.stores_images) {
        for (const storeImage of files.stores_images) {
          const storeImageUrl = await this.cloudinaryService.uploadImage(
            storeImage.buffer,
            `${this.configService.get<string>('CLOUDINARY_BASE_FOLDER')}/suppliers/stores`,
            uuid(),
          );
          store_images.push(storeImageUrl);
        }
      }
    }

    if (supplier.stores && Array.isArray(supplier.stores)) {
      supplier.stores = supplier.stores.map((store, index: number) => {
        return {
          ...store,
          image: store_images[index] || undefined,
        };
      });
    }

    const supplierData = supplier;

    const createdSupplier = new this.supplierModel({
      ...supplierData,
      user: userId,
      logo: logoUrl,
    });
    return createdSupplier.save();
  }

  async findAll(userId: string): Promise<SupplierDocument[]> {
    return this.supplierModel
      .find({
        $or: [{ user: userId }, { user: null }, { user: { $exists: false } }],
      })
      .exec();
  }

  async findOne(id: string): Promise<SupplierDocument | null> {
    return this.supplierModel.findById(id).exec();
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
    files?: {
      supplier?: Express.Multer.File[];
      stores_images?: Express.Multer.File[];
    },
  ): Promise<SupplierDocument | null> {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) return null;

    let logoUrl: string | undefined = supplier.logo;

    // Handle stores parsing
    if (typeof updateSupplierDto.stores === 'string') {
      const parsed = safeJsonParse(updateSupplierDto.stores);
      if (parsed) updateSupplierDto.stores = parsed;
    }

    if (files) {
      if (files.supplier && files.supplier[0]) {
        if (supplier.logo) {
          await this.cloudinaryService.deleteImage(supplier.logo);
        }
        logoUrl = await this.cloudinaryService.uploadImage(
          files.supplier[0].buffer,
          `${this.configService.get<string>('CLOUDINARY_BASE_FOLDER')}/suppliers`,
          uuid(),
        );
      }
    }

    const supplierData = updateSupplierDto;

    return this.supplierModel
      .findByIdAndUpdate(
        id,
        {
          ...supplierData,
          logo: logoUrl,
        },
        { new: true },
      )
      .exec();
  }

  async remove(id: string): Promise<SupplierDocument | null> {
    const supplier = await this.supplierModel.findById(id);
    if (supplier && supplier.logo) {
      await this.cloudinaryService.deleteImage(supplier.logo);
    }

    // Also delete store images if exists
    if (supplier && supplier.stores) {
      for (const store of supplier.stores) {
        if (store.image) {
          await this.cloudinaryService.deleteImage(store.image);
        }
      }
    }
    return this.supplierModel.findByIdAndDelete(id).exec();
  }

  async upsertMany(suppliers: Partial<SupplierModel>[]): Promise<void> {
    for (const supplier of suppliers) {
      if (!supplier.name) continue;
      await this.supplierModel
        .findOneAndUpdate({ name: supplier.name }, supplier, {
          upsert: true,
          new: true,
        })
        .exec();
    }
  }
}
