import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CLIENT_URL'),
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Gift Cards API')
    .setDescription('The Gift Cards API description')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('User')
    .addTag('Card')
    .addTag('Supplier')
    .addTag('Settings')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  console.log('Swagger setup at api/docs');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
