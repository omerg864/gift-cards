import { PipeTransform } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      console.log(error);
      throw new ZodValidationException(error);
    }
  }
}
