import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import {
  ResetEncryptionKeySchema,
  UpdateEncryptionKeySchema,
} from '../../../../../shared/schemas/user.schema';
import { Card } from '../../../../../shared/types/card.types';

export class UpdateEncryptionKeyDto extends createZodDto(
  UpdateEncryptionKeySchema,
) {
  @ApiProperty({ description: 'The salt used for encryption' })
  salt: string;

  @ApiProperty({ description: 'The verification token' })
  verifyToken: string;

  @ApiProperty({ description: 'List of cards to update with new encryption' })
  cards: Card[];
}

export class ResetEncryptionKeyDto extends createZodDto(
  ResetEncryptionKeySchema,
) {
  @ApiProperty({ description: 'The salt used for encryption' })
  salt: string;

  @ApiProperty({ description: 'The verification token' })
  verifyToken: string;
}
