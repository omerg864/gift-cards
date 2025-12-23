import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserSchema } from '@shared/schemas/user.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'base64EncodedImageString' })
  image?: string | null;

  @ApiPropertyOptional({ example: true })
  deleteImage?: boolean;
}
