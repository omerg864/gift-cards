import { Module } from '@nestjs/common';
import { ApiKeyGuard } from '../../lib/common/guards/api-key.guard';
import { CardModule } from '../card/card.module';
import { EmailModule } from '../email/email.module';
import { ScrapingModule } from '../scraping/scraping.module';
import { SettingsModule } from '../settings/settings.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [CardModule, SettingsModule, EmailModule, ScrapingModule],
  controllers: [JobsController],
  providers: [JobsService, ApiKeyGuard],
})
export class JobsModule {}
