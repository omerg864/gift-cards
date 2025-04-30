import axios from 'axios';
import { load } from 'cheerio';
import randomUseragent from 'random-useragent';
import { v4 as uuidv4 } from 'uuid';
import { Store } from '../types/supplier';

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
					name: item.title?.trim() ?? 'Unknown',
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

	// --- LOVE CARD SCRAPER ---
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
		console.log('Scraped Love Card stores:', businesses);
		return businesses;
	}
}
