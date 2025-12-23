import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ROUTES } from '../../../../shared/constants/routes';
import { CreateCardSchema } from '../../../../shared/schemas/card.schema';
import { Card } from '../../../../shared/types/card.types';
import { User as UserType } from '../../../../shared/types/user.types';
import { CheckOwnership } from '../../lib/common/decorators/check-ownership.decorator';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../lib/common/guards/ownership.guard';
import { safeJsonParse } from '../../lib/utils/json.utils';
import { SupplierService } from '../supplier/supplier.service';
import { CardService } from './card.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

@ApiTags('Card')
@Controller(ROUTES.CARD.BASE)
@UseGuards(JwtAuthGuard, OwnershipGuard)
@ApiBearerAuth()
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly supplierService: SupplierService,
  ) {}

  @Post(ROUTES.CARD.CREATE)
  @ApiOperation({ summary: 'Create card' })
  @ApiBody({ type: CreateCardDto })
  @UseInterceptors(FileInterceptor('supplier'))
  async create(
    @Body() createCardDto: CreateCardDto,
    @User() user: UserType,
    @UploadedFile() supplierFile?: Express.Multer.File,
  ) {
    // Handle parsing if sent as FormData string
    if (typeof createCardDto.card === 'string') {
      const parsed = safeJsonParse<z.infer<typeof CreateCardSchema>['card']>(
        createCardDto.card,
      );
      if (parsed) createCardDto.card = parsed;
    }
    if (typeof createCardDto.supplier === 'string') {
      const parsed = safeJsonParse<
        z.infer<typeof CreateCardSchema>['supplier']
      >(createCardDto.supplier);
      if (parsed) createCardDto.supplier = parsed;
    }
    const { supplier, card } = createCardDto;
    const newCard = { ...card, user: user.id };
    if (supplier) {
      const newSupplier = await this.supplierService.create(
        {
          ...supplier,
          user: user.id,
        },
        supplierFile ? { supplier: [supplierFile] } : undefined,
      );
      newCard.supplier = newSupplier._id.toString();
    }
    return this.cardService.create(newCard as Card);
  }

  @Get(ROUTES.CARD.GET_ALL)
  @ApiOperation({ summary: 'Get all cards' })
  findAll(@User() user: UserType) {
    return this.cardService.findAll(user.id);
  }

  @Get(ROUTES.CARD.GET_ONE)
  @ApiOperation({ summary: 'Get card by id' })
  @CheckOwnership({ service: CardService, resourceName: 'card' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.cardService.findOne(id);
  }

  @Patch(ROUTES.CARD.UPDATE)
  @ApiOperation({ summary: 'Update card' })
  @ApiBody({ type: UpdateCardDto })
  @CheckOwnership({ service: CardService, resourceName: 'card' })
  @UseInterceptors(FileInterceptor('supplier'))
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @User() user: UserType,
    @Body() updateCardDto: UpdateCardDto,
    @UploadedFile() supplierFile?: Express.Multer.File,
  ) {
    // Handle parsing if sent as FormData string
    if (typeof updateCardDto.card === 'string') {
      const parsed = safeJsonParse(updateCardDto.card);
      if (parsed) updateCardDto.card = parsed;
    }
    if (typeof updateCardDto.supplier === 'string') {
      const parsed = safeJsonParse(updateCardDto.supplier);
      if (parsed) updateCardDto.supplier = parsed;
    }

    const { supplier, card } = updateCardDto;
    const updatedCard = { ...card };
    if (supplier) {
      const newSupplier = await this.supplierService.create(
        {
          ...supplier,
          user: user.id,
        },
        supplierFile ? { supplier: [supplierFile] } : undefined,
      );
      updatedCard.supplier = newSupplier._id.toString();
    }
    return this.cardService.update(id, updatedCard as Card);
  }

  @Delete(ROUTES.CARD.DELETE)
  @ApiOperation({ summary: 'Delete card' })
  @CheckOwnership({ service: CardService, resourceName: 'card' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.cardService.remove(id);
  }
}
