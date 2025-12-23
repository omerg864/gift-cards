import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '../../../../../shared/schemas/user.schema';

export class CreateUserDto extends createZodDto(CreateUserSchema) {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  password!: string;
}
