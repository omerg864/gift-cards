import { Injectable, Logger } from '@nestjs/common';
import { CardService } from '../card/card.service';
import { EMAIL_SUBJECTS } from '../email/constants';
import { EmailService } from '../email/email.service';
import { ScrapingService } from '../scraping/scraping.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly cardService: CardService,
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
    private readonly scrapingService: ScrapingService,
  ) {}

  async triggerScraping() {
    this.logger.log('Manually triggering scraping job...');
    await this.scrapingService.scrapeAll();
    return { success: true, message: 'Scraping job completed' };
  }

  async triggerBuyMeScraping() {
    this.logger.log('Manually triggering BuyMe scraping job...');
    await this.scrapingService.scrapeBuyMe();
    return { success: true, message: 'BuyMe scraping job completed' };
  }

  async triggerLoveCardScraping() {
    this.logger.log('Manually triggering LoveCard scraping job...');
    await this.scrapingService.scrapeLoveCard();
    return { success: true, message: 'LoveCard scraping job completed' };
  }

  async triggerGoldCardScraping() {
    this.logger.log('Manually triggering TheGoldCard scraping job...');
    await this.scrapingService.scrapeTheGoldCard();
    return { success: true, message: 'TheGoldCard scraping job completed' };
  }

  async triggerNofshonitScraping() {
    this.logger.log('Manually triggering Nofshonit scraping job...');
    await this.scrapingService.scrapeNofshonit();
    return { success: true, message: 'Nofshonit scraping job completed' };
  }

  async triggerDreamCardScraping() {
    this.logger.log('Manually triggering DreamCard scraping job...');
    await this.scrapingService.scrapeDreamCard();
    return { success: true, message: 'DreamCard scraping job completed' };
  }

  async triggerMaxScraping() {
    this.logger.log('Manually triggering MaxGiftCard scraping job...');
    await this.scrapingService.scrapeMaxGiftCard();
    return { success: true, message: 'MaxGiftCard scraping job completed' };
  }

  async sendMonthlyNotifications() {
    this.logger.log('Starting monthly notifications job...');
    const usersSettings = await this.settingsService.findAll();
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    const twoMonthFromNow = new Date();
    twoMonthFromNow.setMonth(now.getMonth() + 2);

    const range1Start = now;
    const range1End = oneMonthFromNow;
    const range2Start = oneMonthFromNow;
    const range2End = twoMonthFromNow;

    const cardsIn1MonthRange = await this.cardService.findBetweenDates(
      range1Start,
      range1End,
      { notified1Month: false },
    );

    const cardsIn2MonthRange = await this.cardService.findBetweenDates(
      range2Start,
      range2End,
      { notified2Month: false },
    );

    for (const card of cardsIn1MonthRange) {
      if (!card.user) continue;
      const user = card.user;
      const userId = user._id.toString();
      const settings = usersSettings.find((s) => s.user?.toString() === userId);

      if (settings?.email1MonthNotification) {
        await this.emailService.sendEmail(EMAIL_SUBJECTS.NOTIFICATION, {
          to: user.email,
          template: EMAIL_SUBJECTS.NOTIFICATION,
          context: {
            cardName: card.name,
            timeLeft: 'less than one month',
          },
        });
        await this.cardService.update(card._id.toString(), {
          notified1Month: true,
        });
      }
    }

    for (const card of cardsIn2MonthRange) {
      if (!card.user) continue;
      const user = card.user;
      const userId = user._id.toString();
      const settings = usersSettings.find((s) => s.user?.toString() === userId);

      if (settings?.email2MonthNotification) {
        await this.emailService.sendEmail(EMAIL_SUBJECTS.NOTIFICATION, {
          to: user.email,
          template: EMAIL_SUBJECTS.NOTIFICATION,
          context: {
            cardName: card.name,
            timeLeft: 'less than two months',
          },
        });
        await this.cardService.update(card._id.toString(), {
          notified2Month: true,
        });
      }
    }

    return { success: true, message: 'Notifications sent' };
  }
}
