"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCardScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const random_useragent_1 = __importDefault(require("random-useragent"));
const uuid_1 = require("uuid");
class GiftCardScraper {
    static fetchHtml(url, retryCount) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < retryCount; i++) {
                try {
                    const userAgent = random_useragent_1.default.getRandom() || this.defaultUserAgent;
                    const response = yield axios_1.default.get(url, {
                        headers: {
                            'User-Agent': userAgent,
                        },
                    });
                    return response.data;
                }
                catch (err) {
                    console.warn(`Retry ${i + 1} failed for ${url}: ${err.message}`);
                }
            }
            throw new Error(`Failed to fetch content from ${url}`);
        });
    }
    static fetchJson(url, retryCount) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < retryCount; i++) {
                try {
                    const userAgent = random_useragent_1.default.getRandom() || this.defaultUserAgent;
                    const response = yield axios_1.default.get(url, {
                        headers: {
                            'User-Agent': userAgent,
                            Accept: 'application/json',
                        },
                    });
                    return response.data;
                }
                catch (err) {
                    console.warn(`Retry ${i + 1} failed for ${url}: ${err.message}`);
                }
            }
            throw new Error(`Failed to fetch JSON from ${url}`);
        });
    }
    static getCached(url) {
        const entry = this.cache[url];
        if (entry && entry.expires > Date.now()) {
            return entry.data;
        }
        return null;
    }
    static setCache(url, data, ttl) {
        this.cache[url] = {
            data,
            expires: Date.now() + ttl,
        };
    }
    // --- BUYME SCRAPER --- https://buyme.co.il/files/siteNewLogo17573670.jpg?v=1743667959 #ffc400
    static scrapeBuyMe(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            var _a, _b, _c, _d;
            const retryCount = (_a = options.retryCount) !== null && _a !== void 0 ? _a : 3;
            const cacheTtl = (_b = options.cacheTtl) !== null && _b !== void 0 ? _b : 1000 * 60 * 10;
            const cached = this.getCached(url);
            if (cached)
                return cached;
            const json = yield this.fetchJson(url, retryCount);
            const businesses = [];
            if (Array.isArray(json.brands)) {
                for (const item of json.brands) {
                    businesses.push({
                        store_id: item.id || (0, uuid_1.v4)(),
                        name: (_d = (_c = item.title) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : 'Unknown',
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
        });
    }
    // --- LOVE CARD SCRAPER ---
    static scrapeLoveCard(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            var _a, _b;
            const cached = this.getCached(url);
            if (cached)
                return cached;
            const html = yield this.fetchHtml(url, (_a = options.retryCount) !== null && _a !== void 0 ? _a : 3);
            const $ = (0, cheerio_1.load)(html);
            let stores = [];
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
            const businesses = stores.map((store) => ({
                store_id: (0, uuid_1.v4)(),
                name: store,
                image: undefined,
            }));
            this.setCache(url, businesses, (_b = options.cacheTtl) !== null && _b !== void 0 ? _b : 1000 * 60 * 10);
            return businesses;
        });
    }
}
exports.GiftCardScraper = GiftCardScraper;
GiftCardScraper.cache = {};
GiftCardScraper.defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
