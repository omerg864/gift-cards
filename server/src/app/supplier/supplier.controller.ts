import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from '@shared/constants/routes';
import { User as UserType } from '@shared/types/user.types';
import { CheckOwnership } from '../../lib/common/decorators/check-ownership.decorator';
import { User } from '../../lib/common/decorators/user.decorator';
import { JwtAuthGuard } from '../../lib/common/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../lib/common/guards/ownership.guard';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { SupplierService } from './supplier.service';

@ApiTags('Supplier')
@Controller(ROUTES.SUPPLIER.BASE)
@UseGuards(JwtAuthGuard, OwnershipGuard)
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post(ROUTES.SUPPLIER.CREATE)
  @ApiOperation({ summary: 'Create supplier' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'supplier', maxCount: 1 },
      { name: 'stores_images', maxCount: 100 },
    ]),
  )
  create(
    @Body() createSupplierDto: CreateSupplierDto,
    @User() user: UserType,
    @UploadedFiles()
    files: {
      supplier?: Express.Multer.File[];
      stores_images?: Express.Multer.File[];
    },
  ) {
    return this.supplierService.create(createSupplierDto, files, user.id);
  }

  @Get(ROUTES.SUPPLIER.GET_ALL)
  @ApiOperation({ summary: 'Get all suppliers' })
  findAll(@User() user: UserType) {
    return this.supplierService.findAll(user.id);
  }

  @Get(ROUTES.SUPPLIER.GET_ONE)
  @ApiOperation({ summary: 'Get supplier by id' })
  @CheckOwnership({
    service: SupplierService,
    resourceName: 'supplier',
    allowSharedRead: true,
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.supplierService.findOne(id);
  }

  @Patch(ROUTES.SUPPLIER.UPDATE)
  @ApiOperation({ summary: 'Update supplier' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'supplier', maxCount: 1 },
      { name: 'stores_images', maxCount: 100 },
    ]),
  )
  @CheckOwnership({
    service: SupplierService,
    resourceName: 'supplier',
    allowSharedRead: true,
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @UploadedFiles()
    files: {
      supplier?: Express.Multer.File[];
      stores_images?: Express.Multer.File[];
    },
  ) {
    return this.supplierService.update(id, updateSupplierDto, files);
  }

  @Delete(ROUTES.SUPPLIER.DELETE)
  @ApiOperation({ summary: 'Delete supplier' })
  @CheckOwnership({
    service: SupplierService,
    resourceName: 'supplier',
    allowSharedRead: true,
  })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.supplierService.remove(id);
  }
}
