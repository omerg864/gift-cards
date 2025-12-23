import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Card } from '../../../../shared/types/card.types';
import { UserDocument } from '../user/schemas/user.schema';
import { CardDocument, CardModel } from './schemas/card.schema';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(CardModel.name) private cardModel: Model<CardDocument>,
  ) {}

  async create(card: Omit<Partial<Card>, 'id'>): Promise<CardDocument> {
    const createdCard = new this.cardModel(card);
    return createdCard.save();
  }

  async findAll(userId: string): Promise<CardDocument[]> {
    return this.cardModel.find({ user: userId }).exec();
  }

  async findOne(id: string): Promise<CardDocument | null> {
    return this.cardModel.findById(id).exec();
  }

  async findBetweenDates(
    startDate: Date,
    endDate: Date,
    query: FilterQuery<CardDocument> = {},
  ): Promise<(CardDocument & { user: UserDocument })[]> {
    return this.cardModel
      .find<CardDocument & { user: UserDocument }>({
        expiry: {
          $gte: startDate,
          $lte: endDate,
        },
        ...query,
      })
      .populate('user');
  }

  async update(
    id: string,
    updatedCard: Partial<Card>,
  ): Promise<CardDocument | null> {
    return this.cardModel
      .findByIdAndUpdate(id, updatedCard, { new: true })
      .exec();
  }

  async remove(id: string): Promise<CardDocument | null> {
    return this.cardModel.findByIdAndDelete(id).exec();
  }
}
