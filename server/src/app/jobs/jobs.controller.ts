import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../lib/common/guards/api-key.guard';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiSecurity('api-key')
@Controller('/api/jobs')
@UseGuards(ApiKeyGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('/monthly-email')
  @ApiOperation({ summary: 'Trigger monthly email notifications' })
  async triggerMonthlyEmails() {
    return this.jobsService.sendMonthlyNotifications();
  }

  @Get('/scrape-providers')
  @ApiOperation({ summary: 'Trigger scraping of all providers' })
  async triggerScraping() {
    return this.jobsService.triggerScraping();
  }

  @Get('/scrape/buyme')
  @ApiOperation({ summary: 'Trigger scraping of BuyMe' })
  async triggerBuyMeScraping() {
    return this.jobsService.triggerBuyMeScraping();
  }

  @Get('/scrape/lovecard')
  @ApiOperation({ summary: 'Trigger scraping of LoveCard' })
  async triggerLoveCardScraping() {
    return this.jobsService.triggerLoveCardScraping();
  }

  @Get('/scrape/goldcard')
  @ApiOperation({ summary: 'Trigger scraping of TheGoldCard' })
  async triggerGoldCardScraping() {
    return this.jobsService.triggerGoldCardScraping();
  }

  @Get('/scrape/nofshonit')
  @ApiOperation({ summary: 'Trigger scraping of Nofshonit' })
  async triggerNofshonitScraping() {
    return this.jobsService.triggerNofshonitScraping();
  }

  @Get('/scrape/dreamcard')
  @ApiOperation({ summary: 'Trigger scraping of DreamCard' })
  async triggerDreamCardScraping() {
    return this.jobsService.triggerDreamCardScraping();
  }

  @Get('/scrape/max')
  @ApiOperation({ summary: 'Trigger scraping of MaxGiftCard' })
  async triggerMaxScraping() {
    return this.jobsService.triggerMaxScraping();
  }
}
