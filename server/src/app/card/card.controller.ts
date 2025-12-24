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
import { ROUTES } from '../../../../shared/constants/routes';
import { Card } from '../../../../shared/types/card.types';
import { User as UserType } from '../../../../shared/types/user.types';
import { CheckOwnership } from '../../lib/common/decorators/check-ownership.decorator';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../lib/common/guards/ownership.guard';
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
