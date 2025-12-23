import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { load } from 'cheerio';
import PDFParser from 'pdf-parse';
import * as randomUseragent from 'random-useragent';
import { v4 as uuidv4 } from 'uuid';
import { getDarkerColor } from '../../lib/colors';
import { EMAIL_SUBJECTS } from '../email/constants';
import { EmailService } from '../email/email.service';
import { SupplierModel } from '../supplier/schemas/supplier.schema';
import { SupplierService } from '../supplier/supplier.service';
import {
  buyMeGiftCardsList,
  dreamCardList,
  loveCardGiftCardsList,
  maxGiftCardList,
  nofshonitCardsList,
  theGoldCardList,
} from './constants';

interface ScraperOptions {
  retryCount?: number;
  cacheTtl?: number; // in milliseconds
}

interface CachedResult {
  data: any[];
  expires: number;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private cache: Record<string, CachedResult> = {};
  private readonly defaultUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

  constructor(
    private readonly supplierService: SupplierService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private async sendAdminErrorEmail(provider: string, error: any) {
    const enableAdminEmails = this.configService.get<boolean>(
      'ENABLE_ADMIN_EMAILS',
    );
    if (!enableAdminEmails) return;

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn(
        `Admin email not configured but admin notifications are enabled.`,
      );
      return;
    }

    await this.emailService.sendEmail(EMAIL_SUBJECTS.SCRAPE_ERROR, {
      to: adminEmail,
      template: EMAIL_SUBJECTS.SCRAPE_ERROR,
      context: {
        provider,
        error: error instanceof Error ? error.message : JSON.stringify(error),
      },
    });
  }

  private async fetchHtml(url: string, retryCount: number): Promise<string> {
    for (let i = 0; i < retryCount; i++) {
      try {
        const userAgent = randomUseragent.getRandom() || this.defaultUserAgent;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
          },
        });
        return response.data;
      } catch (err) {
        this.logger.warn(
          `Retry ${i + 1} failed for ${url}: ${(err as Error).message}`,
        );
      }
    }
    throw new Error(`Failed to fetch content from ${url}`);
  }

  private async fetchJson(
    url: string,
    retryCount: number,
    headers: Record<string, string> = {},
  ): Promise<any> {
    for (let i = 0; i < retryCount; i++) {
      try {
        const userAgent = randomUseragent.getRandom() || this.defaultUserAgent;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/json',
            ...headers,
          },
        });
        return response.data;
      } catch (err) {
        this.logger.warn(
          `Retry ${i + 1} failed for ${url}: ${(err as Error).message}`,
        );
      }
    }
    throw new Error(`Failed to fetch JSON from ${url}`);
  }

  private getCached(url: string): any[] | null {
    const entry = this.cache[url];
    if (entry && entry.expires > Date.now()) {
      return entry.data;
    }
    return null;
  }

  private setCache(url: string, data: any[], ttl: number) {
    this.cache[url] = {
      data,
      expires: Date.now() + ttl,
    };
  }

  // --- BUYME SCRAPER ---
  async scrapeBuyMe() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of buyMeGiftCardsList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores = [];

        if (cached) {
          stores = cached;
        } else {
          const json = await this.fetchJson(giftCard.url, options.retryCount!);
          if (Array.isArray(json.brands)) {
            stores = json.brands.map((item: any) => ({
              store_id: item.id || uuidv4(),
              name: item.title?.trim() ?? 'Unknown',
              image: item.logo
                ? `https://buyme.co.il/files/${item.logo}`
                : undefined,
              address: item.googleMapAddr,
              description: item.smallPrint,
              website: item.siteLink,
              phone: item.phone,
            }));
          }
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          description: 'Buy Me',
          logo: 'https://buyme.co.il/files/siteNewLogo17573670.jpg?v=1743667959',
          fromColor: '#ffc400',
          toColor: getDarkerColor('#ffc400'),
          cardTypes: ['digital'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }

    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  // --- LOVE CARD SCRAPER ---
  async scrapeLoveCard() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of loveCardGiftCardsList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores = [];

        if (cached) {
          stores = cached;
        } else {
          const html = await this.fetchHtml(giftCard.url, options.retryCount!);
          const $ = load(html);
          let storeNames: string[] = [];

          $('li').each((_, el) => {
            const text = $(el).text();
            if (text.includes('קרי, המותגים:')) {
              const match = text.match(/קרי, המותגים:\s*([^)]*)/);
              if (match && match[1]) {
                const parts = match[1]
                  .split(',')
                  .map((s) => s.split('(')[0].trim())
                  .filter(Boolean);
                storeNames.push(...parts);
              }
            }
          });

          storeNames = [...new Set(storeNames)];
          stores = storeNames.map((store) => ({
            store_id: uuidv4(),
            name: store,
          }));
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          description: 'Love Card',
          logo: 'https://img.ice.co.il/giflib/news/rsPhoto/sz_193/rsz_615_346_lovegiftcard870_190818.jpg',
          fromColor: '#383838',
          toColor: getDarkerColor('#383838'),
          cardTypes: ['digital', 'physical'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }

    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  // --- GOLD CARD ---
  async scrapeTheGoldCard() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of theGoldCardList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores = [];

        if (cached) {
          stores = cached;
        } else {
          const json: any = await this.fetchJson(
            giftCard.url,
            options.retryCount!,
          );
          if (
            json.content &&
            json.isSucceeded &&
            json.content.data?.networkingCubes &&
            Array.isArray(json.content.data.networkingCubes)
          ) {
            stores = json.content.data.networkingCubes.map((item: any) => ({
              store_id: item ? `${item.id}` : uuidv4(),
              name: item
                ? `${item.name} - ${item.nameInAnotherLanguage}`
                : 'Unknown',
              image: item.icon
                ? `https://www.shufersal.co.il${item.icon.url}`
                : undefined,
              address: item.address,
              website: item.websilteLink?.[0]?.url,
              phone: item.phone,
            }));
          }
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          description: 'by Shufersal',
          logo: 'https://tavhazahav.shufersal.co.il/tavhazahav/assets/images/logo-zahavt.png',
          fromColor: '#F00000',
          toColor: '#C84664',
          cardTypes: ['digital', 'physical'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }
    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  // --- NOFSHONIT ---
  async scrapeNofshonit() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of nofshonitCardsList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores = [];

        if (cached) {
          stores = cached;
        } else {
          const json: any = await this.fetchJson(
            giftCard.url,
            options.retryCount!,
            { organizationid: '38' },
          );
          if (
            json.status &&
            json.data?.branches &&
            Array.isArray(json.data.branches)
          ) {
            const businessFetched: Record<string, boolean> = {};
            for (const item of json.data.branches) {
              if (businessFetched[item.storeName]) continue;
              stores.push({
                store_id: `${item.businessId}` || uuidv4(),
                name: item.storeName || 'Unknown',
                image: item.businessLogoFile,
                phone: item.phone,
              });
              businessFetched[item.storeName] = true;
            }
          }
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          logo: 'https://styleproductionpublic.blob.core.windows.net/files/560/FILE-20200720-0828HF7BKZCTMFC7.png',
          fromColor: '#C8F0F2',
          toColor: '#50BEBE',
          cardTypes: ['digital', 'physical'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }
    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  // --- DREAM CARD ---
  async scrapeDreamCard() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of dreamCardList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores: { name: string; image: string; store_id: string }[] = [];

        if (cached) {
          stores = cached;
        } else {
          const html = await this.fetchHtml(giftCard.url, options.retryCount!);
          const $ = load(html);
          $('li').each((_, element) => {
            const name = $(element).find('h2.s_title').text().trim();
            const image = $(element).find('img').attr('src')?.trim() ?? '';
            if (name) {
              stores.push({ name, image, store_id: uuidv4() });
            }
          });
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          logo: 'https://www.dreamcard.co.il/filestock/images/dream%20card.png',
          fromColor: '#D8039F',
          toColor: '#C841BE',
          cardTypes: ['digital', 'physical'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }
    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  private async fetchPdf(url: string, retryCount: number): Promise<Buffer> {
    for (let i = 0; i < retryCount; i++) {
      try {
        const userAgent = randomUseragent.getRandom() || this.defaultUserAgent;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': userAgent,
          },
          responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
      } catch (err) {
        this.logger.warn(
          `Retry ${i + 1} failed for ${url}: ${(err as Error).message}`,
        );
      }
    }
    throw new Error(`Failed to fetch PDF from ${url}`);
  }

  async scrapeMaxGiftCard() {
    const suppliers: Partial<SupplierModel>[] = [];
    const options: ScraperOptions = { retryCount: 3, cacheTtl: 1000 * 60 * 10 };

    for (const giftCard of maxGiftCardList) {
      try {
        const cached = this.getCached(giftCard.url);
        let stores = [];

        if (cached) {
          stores = cached;
        } else {
          const pdf = await this.fetchPdf(giftCard.url, options.retryCount!);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
          const data = await (PDFParser as any)(pdf);
          // Hardcoded logic from old server strictly
          stores = [
            { name: 'INTIMA' },
            { name: 'POLGAT' },
            { name: 'FOOT LOCKER' },
            { name: 'TERMINAL X' },
            { name: 'GOLF Kids&Baby' },
            { name: 'GOLF&Co' },
            { name: 'GOLF' },
            { name: 'Aerie' },
            { name: 'FOX' },
            { name: 'FOX Home' },
            { name: 'AMERICAN EAGLE' },
            { name: 'QUIKSILVER' },
            { name: 'BOARDRIDERS' },
            { name: 'ROXY' },
            { name: 'THE CHILDRENS PLACE' },
            { name: 'BILLABONG' },
            { name: 'YANGA' },
            { name: 'LALINE' },
            { name: 'שילב' },
            { name: 'מיננה' },
            { name: 'עמנואל' },
            { name: 'Converse' },
            { name: 'sunglass hut' },
            { name: 'עדיקה' },
            { name: 'LAVAN' },
            { name: 'Asics' },
            { name: 'BIRKENSTOCK' },
            { name: 'המשביר לצרכן' },
            { name: "Original's" },
            { name: 'FACTORY 54' },
            { name: 'Michael Kors' },
            { name: 'HUGO' },
            { name: 'ICE CUBE' },
            { name: 'H&O' },
            { name: 'Kitan' },
            { name: 'Armani Exchange' },
            { name: 'FRED PERRY' },
            { name: 'LEVIS' },
            { name: 'PAUL&SHARK' },
            { name: 'TOMMY HILFIGER' },
            { name: 'PUMA' },
            { name: 'PETIT BATEAU' },
            { name: 'LACOSTE' },
            { name: 'Calvin Klein' },
            { name: 'DIESEL' },
            { name: 'סטימצקי' },
            { name: 'American Comfort' },
            { name: 'עמינח' },
            { name: 'Good Night' },
            { name: 'Desigual' },
            { name: 'LONGCHAMP' },
            { name: 'Superdry' },
            { name: 'TOUS' },
            { name: 'SABON' },
            { name: 'ACE' },
            { name: 'AUTODEPOT' },
            { name: 'מגה ספורט' },
            { name: 'מגה קידס' },
            { name: 'סינמה סיטי' },
            { name: 'DAPHNA LEVINSON' },
            { name: 'NAUTICA' },
            { name: 'REPLAY' },
            { name: 'INTER JEANS' },
            { name: 'STEVE MADDEN' },
            { name: 'לונה פארק' },
            { name: 'הום סנטר' },
            { name: 'LADY COMFORT' },
            { name: 'קפה נטו' },
            { name: 'PERSONAL TRAINERS' },
            { name: 'מלונות אסטרל' },
            { name: 'מלכת שבא' },
            { name: 'BLIK' },
            { name: 'HOME STYLE' },
            { name: 'א.ל.מ' },
            { name: 'ARTIKIM TLV' },
            { name: 'IJUMP' },
            { name: 'HAVAIANAS' },
            { name: 'IL MAKIAGE' },
            { name: 'SKECHERS' },
            { name: "מלונות ג'יקוב" },
            { name: 'עצמלה' },
            { name: 'שקם אלקטריק' },
            { name: 'הבורסה לתכשיטים' },
            { name: 'מוצצים' },
          ].map((s) => ({ ...s, store_id: uuidv4(), image: '' }));
          this.setCache(giftCard.url, stores, options.cacheTtl!);
        }

        suppliers.push({
          name: giftCard.name,
          stores,
          logo: 'https://max.co.il/files/miscellaneous/max_gift_card.png',
          fromColor: '#e01235',
          toColor: '#304562',
          cardTypes: ['digital', 'physical'],
        });
      } catch (error) {
        this.logger.error(`Error scraping ${giftCard.name}`, error);
        await this.sendAdminErrorEmail(giftCard.name, error);
      }
    }
    if (suppliers.length > 0) {
      await this.supplierService.upsertMany(suppliers as any);
    }
    return suppliers;
  }

  async scrapeAll() {
    this.logger.log('Scraping all providers...');
    await Promise.all([
      this.scrapeBuyMe(),
      this.scrapeLoveCard(),
      this.scrapeTheGoldCard(),
      this.scrapeNofshonit(),
      this.scrapeDreamCard(),
      this.scrapeMaxGiftCard(),
    ]);
  }
}
