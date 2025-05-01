import axios from 'axios';
import { load } from 'cheerio';
import randomUseragent from 'random-useragent';
import { v4 as uuidv4 } from 'uuid';
import { Store } from '../types/supplier';
import PDFParser from 'pdf-parse';

export interface ScraperOptions {
	retryCount?: number;
	cacheTtl?: number; // in milliseconds
}

interface CachedResult {
	data: Store[];
	expires: number;
}

export class GiftCardScraper {
	private static cache: Record<string, CachedResult> = {};

	private static defaultUserAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

	private static giftCardsList = [
		{
			name: 'BuyMe - Local',
			url: 'https://buyme.co.il/brands/17573670/options',
		},
		{
			name: 'BuyMe - עוטפים עסקים',
			url: 'https://buyme.co.il/brands/17573891/options',
		},
		{
			name: 'BuyMe - Kosher',
			url: 'https://buyme.co.il/brands/4299680/options',
		},
		{
			name: 'BuyMe - Brunch',
			url: 'https://buyme.co.il/brands/17573615/options',
		},
		{
			name: 'BuyMe - Chef',
			url: 'https://buyme.co.il/brands/752649/options',
		},
		{
			name: 'BuyMe - Vacation & Spa',
			url: 'https://buyme.co.il/brands/17573505/options',
		},
		{
			name: 'BuyMe - Cheers',
			url: 'https://buyme.co.il/brands/17573505/options',
		},
		{
			name: 'BuyMe - All',
			url: 'https://buyme.co.il/brands/13438757/options',
		},
		{
			name: 'BuyMe - Foody',
			url: 'https://buyme.co.il/brands/17573460/options',
		},
		{
			name: 'BuyMe - Fashion',
			url: 'https://buyme.co.il/brands/20620/options',
		},
		{
			name: 'Buy Me - Home Design',
			url: 'https://buyme.co.il/brands/15490363/options',
		},
		{
			name: 'Buy Me - Wellness',
			url: 'https://buyme.co.il/brands/15925581/options',
		},
	];

	private static async fetchHtml(
		url: string,
		retryCount: number
	): Promise<string> {
		for (let i = 0; i < retryCount; i++) {
			try {
				const userAgent =
					randomUseragent.getRandom() || this.defaultUserAgent;
				const response = await axios.get(url, {
					headers: {
						'User-Agent': userAgent,
					},
				});
				return response.data;
			} catch (err) {
				console.warn(
					`Retry ${i + 1} failed for ${url}: ${
						(err as Error).message
					}`
				);
			}
		}
		throw new Error(`Failed to fetch content from ${url}`);
	}

	private static async fetchJson(
		url: string,
		retryCount: number
	): Promise<any> {
		for (let i = 0; i < retryCount; i++) {
			try {
				const userAgent =
					randomUseragent.getRandom() || this.defaultUserAgent;
				const response = await axios.get(url, {
					headers: {
						'User-Agent': userAgent,
						Accept: 'application/json',
					},
				});
				return response.data;
			} catch (err) {
				console.warn(
					`Retry ${i + 1} failed for ${url}: ${
						(err as Error).message
					}`
				);
			}
		}
		throw new Error(`Failed to fetch JSON from ${url}`);
	}

	private static async fetchPdf(url: string, retryCount: number) {
		for (let i = 0; i < retryCount; i++) {
			try {
				const userAgent =
					randomUseragent.getRandom() || this.defaultUserAgent;
				const response = await axios.get(url, {
					headers: {
						'User-Agent': userAgent,
					},
					responseType: 'arraybuffer',
				});
				return Buffer.from(response.data);
			} catch (err) {
				console.warn(
					`Retry ${i + 1} failed for ${url}: ${
						(err as Error).message
					}`
				);
			}
		}
		throw new Error(`Failed to fetch PDF from ${url}`);
	}

	private static getCached(url: string): Store[] | null {
		const entry = this.cache[url];
		if (entry && entry.expires > Date.now()) {
			return entry.data;
		}
		return null;
	}

	private static setCache(url: string, data: Store[], ttl: number) {
		this.cache[url] = {
			data,
			expires: Date.now() + ttl,
		};
	}

	// --- BUYME SCRAPER --- https://buyme.co.il/files/siteNewLogo17573670.jpg?v=1743667959 #ffc400
	public static async scrapeBuyMe(
		url: string,
		options: ScraperOptions = {}
	): Promise<Store[]> {
		const retryCount = options.retryCount ?? 3;
		const cacheTtl = options.cacheTtl ?? 1000 * 60 * 10;

		const cached = this.getCached(url);
		if (cached) return cached;

		const json = await this.fetchJson(url, retryCount);
		const businesses: Store[] = [];

		if (Array.isArray(json.brands)) {
			for (const item of json.brands) {
				businesses.push({
					store_id: item.id || uuidv4(),
					name: item.title ?? 'Unknown',
					image: item.logo
						? `https://buyme.co.il/files/${item.logo}`
						: undefined,
					address: item.googleMapAddr,
					description: item.smallPrint,
					website: item.siteLink,
					phone: item.phone,
				});
			}
		}

		this.setCache(url, businesses, cacheTtl);
		return businesses;
	}

	// --- LOVECARD SCRAPER (Placeholder) ---
	public static async scrapeLoveCard(
		url: string,
		options: ScraperOptions = {}
	): Promise<Store[]> {
		const cached = this.getCached(url);
		if (cached) return cached;

		const html = await this.fetchHtml(url, options.retryCount ?? 3);
		const $ = load(html);
		let stores: string[] = [];

		$('li').each((_, el) => {
			const text = $(el).text();
			if (text.includes('קרי, המותגים:')) {
				const match = text.match(/קרי, המותגים:\s*([^)]*)/);
				if (match && match[1]) {
					stores = match[1]
						.split(',')
						.map((s) => {
							// Remove anything in parentheses or after them
							const clean = s.split('(')[0].trim();
							return clean;
						})
						.filter(Boolean);
				}
			}
		});

		stores = [...new Set(stores)]; // Remove duplicates
		const businesses: Store[] = stores.map((store) => ({
			store_id: uuidv4(),
			name: store,
			image: undefined,
		}));
		this.setCache(url, businesses, options.cacheTtl ?? 1000 * 60 * 10);
		return businesses;
	}

	// --- SCRAPE Max Gift Card ---
	public static async scrapeMaxGiftCard(
		url: string,
		options: ScraperOptions = {}
	): Promise<Store[]> {
		const cached = this.getCached(url);
		if (cached) return cached;

		const pdf = await this.fetchPdf(url, options.retryCount ?? 3);
		const data = await PDFParser(pdf);
		const businesses: Store[] = [
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
		];

		this.setCache(url, businesses, options.cacheTtl ?? 1000 * 60 * 10);
		return businesses;
	}
}

// --- TESTING THE SCRAPER ---
(async () => {
	const url =
		'https://www.max.co.il/SharedMedia/11013/max-alon-gc_online_02-2025.pdf';
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};

	try {
		const businesses = await GiftCardScraper.scrapeMaxGiftCard(
			url,
			options
		);
		console.log('Scraped Businesses:', businesses);
	} catch (error) {
		console.error('Error scraping:', error);
	}
})();
