import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Card } from '../../../../shared/types/card.types';
import { User } from '../../../../shared/types/user.types';
import { CloudinaryService } from '../../lib/cloudinary/cloudinary.service';
import { CardDocument, CardModel } from '../card/schemas/card.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument, UserModel } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
    @InjectModel(CardModel.name) private cardModel: Model<CardDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

  async create(user: Omit<User, 'id'>): Promise<UserDocument> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: { $regex: email, $options: 'i' } })
      .exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    if (file) {
      if (user.image) {
        await this.cloudinaryService.deleteImage(user.image);
      }
      const publicId = await this.cloudinaryService.uploadImage(
        file.buffer,
        `${this.configService.get<string>('CLOUDINARY_BASE_FOLDER')}/users`,
        uuid(),
      );
      updateUserDto.image = publicId;
    }

    if (updateUserDto.deleteImage && updateUserDto.deleteImage === true) {
      if (user.image) {
        await this.cloudinaryService.deleteImage(user.image);
      }
      updateUserDto.image = null;
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async setEncryptionKey(id: string, salt: string, verifyToken: string) {
    return this.userModel
      .findByIdAndUpdate(id, { salt, verifyToken }, { new: true })
      .exec();
  }

  async updateEncryptionKey(
    id: string,
    salt: string,
    verifyToken: string,
    cards: Card[],
  ) {
    await this.userModel
      .findByIdAndUpdate(id, { salt, verifyToken }, { new: true })
      .exec();

    const updatePromises = cards.map((card) => {
      const { id, ...updateData } = card;
      if (!id) return Promise.resolve();
      return this.cardModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
    });

    const updatedCards = await Promise.all(updatePromises);
    return { success: true, cards: updatedCards };
  }

  async resetEncryptionKey(id: string, salt: string, verifyToken: string) {
    // 1. Update user
    await this.userModel
      .findByIdAndUpdate(id, { salt, verifyToken }, { new: true })
      .exec();

    // 2. Find all user cards
    const userCards = await this.cardModel.find({ user: id });

    // 3. Clear sensitive fields
    const updatePromises = userCards.map((card) => {
      return this.cardModel
        .findByIdAndUpdate(
          card._id,
          {
            cvv: null,
            last4: null,
            cardNumber: null,
          },
          { new: true },
        )
        .exec();
    });

    const updatedCards = await Promise.all(updatePromises);
    return { success: true, cards: updatedCards };
  }
}
