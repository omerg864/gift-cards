import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { SupplierModule } from '../supplier/supplier.module';
import { ScrapingService } from './scraping.service';

@Module({
  imports: [SupplierModule, EmailModule],
  controllers: [],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
