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
}
