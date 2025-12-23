import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { LoginUserSchema } from '../../../../../shared/schemas/user.schema';
import type { Device } from '../../../../../shared/types/device.types';

export class LoginUserDto extends createZodDto(LoginUserSchema) {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  password!: string;

  @ApiProperty({
    example: { id: 'device-123', name: 'Chrome on MacOS', type: 'browser' },
    description: 'Device information',
  })
  device!: Device;
}
