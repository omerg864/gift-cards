import { ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import {
  CreateSettingsSchema,
  UpdateSettingsSchema,
} from '../../../../../shared/schemas/settings.schema';

export class CreateSettingsDto extends createZodDto(CreateSettingsSchema) {
  @ApiPropertyOptional({
    example: true,
    description: 'Send email 1 month before expiry',
    default: false,
  })
  email1Month?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Send email 2 months before expiry',
    default: false,
  })
  email2Month?: boolean;
}

export class UpdateSettingsDto extends createZodDto(UpdateSettingsSchema) {
  @ApiPropertyOptional({
    example: true,
    description: 'Send email 1 month before expiry',
  })
  email1MonthNotification?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Send email 2 months before expiry',
  })
  email2MonthNotification?: boolean;
}
