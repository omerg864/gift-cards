import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  CreateCardSchema,
  UpdateCardSchema,
} from '../../../../../shared/schemas/card.schema';

export class CreateCardDto extends createZodDto(CreateCardSchema) {
  @ApiProperty({
    example: {
      name: 'Amazon Gift Card',
      supplier: '507f1f77bcf86cd799439011',
      description: 'Gift card for Amazon purchases',
      isPhysical: false,
      amount: 100,
      currency: 'USD',
      cardNumber: '1234-5678-9012-3456',
      expiry: '2025-12-31T00:00:00Z',
      last4: '3456',
      cvv: '123',
    },
    description: 'Card details',
  })
  card: z.infer<typeof CreateCardSchema>['card'];

  @ApiProperty({
    example: {
      name: 'Amazon',
      description: 'Gift card for Amazon purchases',
      stores: [
        {
          name: 'Amazon',
          address: '123 Main St',
          image: 'https://example.com/image.jpg',
          description: 'Gift card for Amazon purchases',
          store_id: '507f1f77bcf86cd799439011',
          website: 'https://amazon.com',
          phone: '123-456-7890',
        },
      ],
      logo: 'https://example.com/logo.jpg',
      cardTypes: ['digital', 'physical'],
      fromColor: '#FF0000',
      toColor: '#00FF00',
    },
    description: 'Supplier details',
  })
  supplier?: z.infer<typeof CreateCardSchema>['supplier'];
}

export class UpdateCardDto extends createZodDto(UpdateCardSchema) {
  @ApiProperty({
    example: {
      name: 'Amazon Gift Card',
      supplier: '507f1f77bcf86cd799439011',
      description: 'Gift card for Amazon purchases',
      isPhysical: false,
      amount: 100,
      currency: 'USD',
      cardNumber: '1234-5678-9012-3456',
      expiry: '2025-12-31T00:00:00Z',
      last4: '3456',
      cvv: '123',
    },
    description: 'Card details',
  })
  card: z.infer<typeof UpdateCardSchema>['card'];

  @ApiProperty({
    example: {
      name: 'Amazon',
      description: 'Gift card for Amazon purchases',
      stores: [
        {
          name: 'Amazon',
          address: '123 Main St',
          image: 'https://example.com/image.jpg',
          description: 'Gift card for Amazon purchases',
          store_id: '507f1f77bcf86cd799439011',
          website: 'https://amazon.com',
          phone: '123-456-7890',
        },
      ],
      logo: 'https://example.com/logo.jpg',
      cardTypes: ['digital', 'physical'],
      fromColor: '#FF0000',
      toColor: '#00FF00',
    },
    description: 'Supplier details',
  })
  supplier?: z.infer<typeof UpdateCardSchema>['supplier'];
}
