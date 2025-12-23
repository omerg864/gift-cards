import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSettingsDto, UpdateSettingsDto } from './dto/settings.dto';
import { SettingsDocument, SettingsModel } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SettingsModel.name)
    private settingsModel: Model<SettingsDocument>,
  ) {}

  async create(
    createSettingsDto: CreateSettingsDto,
  ): Promise<SettingsDocument> {
    const createdSettings = new this.settingsModel(createSettingsDto);
    return createdSettings.save();
  }

  async findAll(): Promise<SettingsDocument[]> {
    return this.settingsModel.find().exec();
  }

  async findOne(id: string): Promise<SettingsDocument | null> {
    return this.settingsModel.findById(id).exec();
  }

  async update(
    id: string,
    updateSettingsDto: CreateSettingsDto,
  ): Promise<SettingsDocument | null> {
    return this.settingsModel
      .findByIdAndUpdate(id, updateSettingsDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<SettingsDocument | null> {
    return this.settingsModel.findByIdAndDelete(id).exec();
  }

  async findByUser(userId: string): Promise<SettingsDocument | null> {
    return this.settingsModel.findOne({ user: userId }).exec();
  }

  async updateByUser(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<SettingsDocument | null> {
    let settings = await this.settingsModel.findOne({ user: userId }).exec();
    if (!settings) {
      settings = new this.settingsModel({ user: userId, ...updateSettingsDto });
      return settings.save();
    }
    return this.settingsModel
      .findOneAndUpdate({ user: userId }, updateSettingsDto, { new: true })
      .exec();
  }
}
