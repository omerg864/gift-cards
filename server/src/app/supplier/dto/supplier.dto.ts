import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
} from '@shared/schemas/supplier.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateSupplierDto extends createZodDto(CreateSupplierSchema) {
  @ApiProperty({ example: 'Amazon', description: 'Supplier name' })
  name!: string;

  @ApiProperty({
    example: ['Physical', 'Digital'],
    description: 'Types of cards offered',
    type: [String],
  })
  cardTypes!: string[];

  @ApiProperty({ example: '#FF5733', description: 'Start gradient color' })
  fromColor!: string;

  @ApiProperty({ example: '#C70039', description: 'End gradient color' })
  toColor!: string;

  @ApiPropertyOptional({
    example: [{ name: 'Store 1', address: '123 Main St' }],
    description: 'Store locations',
    type: 'array',
  })
  stores?: Array<{ name: string; address?: string }>;
}

export class UpdateSupplierDto extends createZodDto(UpdateSupplierSchema) {
  @ApiPropertyOptional({ example: 'Amazon', description: 'Supplier name' })
  name: string;

  @ApiPropertyOptional({
    example: ['Physical', 'Digital'],
    description: 'Types of cards offered',
    type: [String],
  })
  cardTypes: string[];

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Start gradient color',
  })
  fromColor: string;

  @ApiPropertyOptional({
    example: '#C70039',
    description: 'End gradient color',
  })
  toColor: string;

  @ApiPropertyOptional({
    example: [{ name: 'Store 1', address: '123 Main St' }],
    description: 'Store locations',
    type: 'array',
  })
  stores?: Array<{ name: string; address?: string }>;
}
