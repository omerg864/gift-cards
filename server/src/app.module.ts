import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './app/auth/auth.module';
import { CardModule } from './app/card/card.module';
import { JobsModule } from './app/jobs/jobs.module';
import { ScrapingModule } from './app/scraping/scraping.module';
import { SettingsModule } from './app/settings/settings.module';
import { SupplierModule } from './app/supplier/supplier.module';
import { UserModule } from './app/user/user.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CardModule,
    SupplierModule,
    SettingsModule,
    AuthModule,
    ScrapingModule,
    JobsModule,
  ],
})
export class AppModule {}
