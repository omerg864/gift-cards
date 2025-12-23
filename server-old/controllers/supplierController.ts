import AsyncHandler from 'express-async-handler';
import {
	deleteUserSupplierById,
	getSupplier,
	getUserSupplier,
	getUserSuppliers,
	newUserSupplier,
	updateSupplier,
	upsertSuppliers,
} from '../services/supplierService';
import { GiftCardScraper, ScraperOptions } from '../utils/Scraper';
import {
	buyMeGiftCardsList,
	dreamCardList,
	loveCardGiftCardsList,
	maxGiftCardList,
	nofshonitCardsList,
	theGoldCardList,
} from '../utils/constants';
import { Supplier } from '../types/supplier';
import { getDarkerColor } from '../utils/colors';
import { sendEmail } from '../utils/functions';

const getSuppliers = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const suppliers = await getUserSuppliers(user);
	res.status(200).json({
		success: true,
		suppliers,
	});
});

const createUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const { name, description, fromColor, toColor } = req.body;
	let { stores = '[]', cardTypes = '["digital"]' } = req.body;
	stores = JSON.parse(stores);
	cardTypes = JSON.parse(cardTypes);

	if (!Array.isArray(cardTypes) || cardTypes.length === 0) {
		res.status(400);
		throw new Error('Card types are required');
	}

	if (!Array.isArray(stores)) {
		res.status(400);
		throw new Error('Stores are required');
	}

	if (!name || !fromColor || !toColor) {
		res.status(400);
		throw new Error('Please add all required fields');
	}
	if (!Array.isArray(cardTypes) || !cardTypes || cardTypes.length === 0) {
		res.status(400);
		throw new Error('Card types are required');
	}

	const supplier = await newUserSupplier(
		req.files,
		name,
		description,
		cardTypes,
		stores,
		fromColor,
		toColor,
		user
	);

	res.status(201).json({
		success: true,
		supplier,
	});
});

const getSupplierById = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;

	const supplier = await getSupplier(supplierId, user);

	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}

	res.status(200).json({
		success: true,
		supplier,
	});
});

const updateUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;
	const { name, deleteImageBool, description, fromColor, toColor } = req.body;
	let { stores = '[]', cardTypes = '["digital"]' } = req.body;

	const deleteImage = deleteImageBool === 'true' ? true : false;

	stores = JSON.parse(stores);
	cardTypes = JSON.parse(cardTypes);
	if (!Array.isArray(cardTypes) || !cardTypes || cardTypes.length === 0) {
		res.status(400);
		throw new Error('Card types are required');
	}
	if (!Array.isArray(stores)) {
		res.status(400);
		throw new Error('Stores are required');
	}

	if (!name) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	if (!supplierId) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const supplier = await getUserSupplier(supplierId, user);

	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}

	const updatedSupplier = await updateSupplier(
		supplier,
		{
			name,
			stores,
			description,
			cardTypes,
			fromColor,
			toColor,
		},
		user,
		req.file,
		deleteImage
	);

	res.status(200).json({
		success: true,
		supplier: updatedSupplier,
	});
});

const deleteUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;
	const supplier = await deleteUserSupplierById(user, supplierId);
	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}
	res.status(200).json({
		success: true,
		message: 'Supplier deleted',
	});
});

const scrapeBuyMeGiftCards = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const buyMeSuppliers: Supplier[] = [];
	for (let i = 0; i < buyMeGiftCardsList.length; i++) {
		const giftCardData = buyMeGiftCardsList[i];
		try {
			const stores = await GiftCardScraper.scrapeBuyMe(
				giftCardData.url,
				options
			);
			buyMeSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				description: 'Buy Me',
				logo: 'https://buyme.co.il/files/siteNewLogo17573670.jpg?v=1743667959',
				fromColor: '#ffc400',
				toColor: getDarkerColor('#ffc400'),
				cardTypes: ['digital'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
			<h1>Scrape Action Failed</h1>
			<p>Dear Admin,</p>
			<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
			<p>Error Details:</p>
			<pre>${error}</pre>
			<p>Please investigate the issue at your earliest convenience.</p>
			<p>Thank you,</p>
			<p>Your Automated System</p>
		</div>`
			);
		}
	}
	if (buyMeSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping BuyMe`,
			`Error scraping BuyMe: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>BuyMe</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(buyMeSuppliers);
	res.status(200).json({
		success: true,
		buyMeSuppliers,
	});
});

const scrapeLoveCardSupplier = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const loveCardSuppliers: Supplier[] = [];
	for (let i = 0; i < loveCardGiftCardsList.length; i++) {
		const giftCardData = loveCardGiftCardsList[i];
		try {
			const stores = await GiftCardScraper.scrapeLoveCard(
				giftCardData.url,
				options
			);
			loveCardSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				description: 'Love Card',
				logo: 'https://img.ice.co.il/giflib/news/rsPhoto/sz_193/rsz_615_346_lovegiftcard870_190818.jpg',
				fromColor: '#383838',
				toColor: getDarkerColor('#383838'),
				cardTypes: ['digital', 'physical'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
			<h1>Scrape Action Failed</h1>
			<p>Dear Admin,</p>
			<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
			<p>Error Details:</p>
			<pre>${error}</pre>
			<p>Please investigate the issue at your earliest convenience.</p>
			<p>Thank you,</p>
			<p>Your Automated System</p>
		</div>`
			);
		}
	}
	if (loveCardSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping LoveCard`,
			`Error scraping LoveCard: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>LoveCard</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(loveCardSuppliers);
	res.status(200).json({
		success: true,
		loveCardSuppliers,
	});
});

const scrapeMaxGiftCardSupplier = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const maxGiftCardSuppliers: Supplier[] = [];
	for (let i = 0; i < maxGiftCardList.length; i++) {
		const giftCardData = maxGiftCardList[i];
		try {
			const stores = await GiftCardScraper.scrapeLoveCard(
				giftCardData.url,
				options
			);
			maxGiftCardSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				description: 'Max Gift Card',
				logo: 'https://res.cloudinary.com/omerg/image/upload/v1746091807/GiftCard/suppliers/gv7q3hycpoaagzzhnydh.png',
				fromColor: '#0DF4F8',
				toColor: getDarkerColor('#0DF4F8'),
				cardTypes: ['digital', 'physical'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
			<h1>Scrape Action Failed</h1>
			<p>Dear Admin,</p>
			<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
			<p>Error Details:</p>
			<pre>${error}</pre>
			<p>Please investigate the issue at your earliest convenience.</p>
			<p>Thank you,</p>
			<p>Your Automated System</p>
		</div>`
			);
		}
	}
	if (maxGiftCardSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping MaxGiftCard`,
			`Error scraping MaxGiftCard: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>MaxGiftCard</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(maxGiftCardSuppliers);
	res.status(200).json({
		success: true,
		maxGiftCardSuppliers,
	});
});

const scrapeTheGoldCardSupplier = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const goldCardSuppliers: Supplier[] = [];
	for (let i = 0; i < theGoldCardList.length; i++) {
		const giftCardData = theGoldCardList[i];
		try {
			const stores = await GiftCardScraper.scrapeTheGoldCard(
				giftCardData.url,
				options
			);
			goldCardSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				description: 'by Shufersal',
				logo: 'https://tavhazahav.shufersal.co.il/tavhazahav/assets/images/logo-zahavt.png',
				fromColor: '#F00000',
				toColor: '#C84664',
				cardTypes: ['digital', 'physical'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
			<h1>Scrape Action Failed</h1>
			<p>Dear Admin,</p>
			<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
			<p>Error Details:</p>
			<pre>${error}</pre>
			<p>Please investigate the issue at your earliest convenience.</p>
			<p>Thank you,</p>
			<p>Your Automated System</p>
		</div>`
			);
		}
	}
	if (goldCardSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping GoldCard`,
			`Error scraping GoldCard: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>GoldCard</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(goldCardSuppliers);
	res.status(200).json({
		success: true,
		goldCardSuppliers,
	});
});

const scrapeNofshonitSupplier = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const nofshonitSuppliers: Supplier[] = [];
	for (let i = 0; i < nofshonitCardsList.length; i++) {
		const giftCardData = nofshonitCardsList[i];
		try {
			const stores = await GiftCardScraper.scrapeNofshonit(
				giftCardData.url,
				options
			);
			nofshonitSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				logo: 'https://styleproductionpublic.blob.core.windows.net/files/560/FILE-20200720-0828HF7BKZCTMFC7.png',
				fromColor: '#C8F0F2', // 200 240 242
				toColor: '#50BEBE', // 80 190 190
				cardTypes: ['digital', 'physical'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
				<p>Error Details:</p>
				<pre>${error}</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
			</div>`
			);
		}
	}
	if (nofshonitSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping Nofshonit`,
			`Error scraping Nofshonit: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>Nofshonit</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(nofshonitSuppliers);
	res.status(200).json({
		success: true,
		nofshonitSuppliers,
	});
});

const scrapeDreamCardSupplier = AsyncHandler(async (req, res) => {
	const options: ScraperOptions = {
		retryCount: 3,
		cacheTtl: 1000 * 60 * 10,
	};
	const dreamCardSuppliers: Supplier[] = [];
	for (let i = 0; i < dreamCardList.length; i++) {
		const giftCardData = dreamCardList[i];
		try {
			const stores = await GiftCardScraper.scrapeDreamCard(
				giftCardData.url,
				options
			);
			dreamCardSuppliers.push({
				name: giftCardData.name,
				stores: stores,
				logo: 'https://www.dreamcard.co.il/filestock/images/dream%20card.png',
				fromColor: '#D8039F',
				toColor: '#C841BE',
				cardTypes: ['digital', 'physical'],
			});
		} catch (error) {
			console.error(`Error scraping ${giftCardData.name}: ${error}`);
			sendEmail(
				process.env.ADMIN_EMAIL!,
				`Error scraping ${giftCardData.name}`,
				`Error scraping ${giftCardData.name}: ${error}`,
				`<div>
					<h1>Scrape Action Failed</h1>
					<p>Dear Admin,</p>
					<p>We encountered an error while attempting to scrape the gift card: <strong>${giftCardData.name}</strong>.</p>
					<p>Error Details:</p>
					<pre>${error}</pre>
					<p>Please investigate the issue at your earliest convenience.</p>
					<p>Thank you,</p>
					<p>Your Automated System</p>
				</div>`
			);
		}
	}
	if (dreamCardSuppliers.length === 0) {
		sendEmail(
			process.env.ADMIN_EMAIL!,
			`Error scraping DreamCard`,
			`Error scraping DreamCard: No suppliers found`,
			`<div>
				<h1>Scrape Action Failed</h1>
				<p>Dear Admin,</p>
				<p>We encountered an error while attempting to scrape the gift card: <strong>DreamCard</strong>.</p>
				<p>Error Details:</p>
				<pre>No suppliers found</pre>
				<p>Please investigate the issue at your earliest convenience.</p>
				<p>Thank you,</p>
				<p>Your Automated System</p>
				</div>`
		);
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(dreamCardSuppliers);
	res.status(200).json({
		success: true,
		dreamCardSuppliers,
	});
});

export {
	getSuppliers,
	createUserSupplier,
	getSupplierById,
	updateUserSupplier,
	deleteUserSupplier,
	scrapeBuyMeGiftCards,
	scrapeLoveCardSupplier,
	scrapeMaxGiftCardSupplier,
	scrapeTheGoldCardSupplier,
	scrapeNofshonitSupplier,
	scrapeDreamCardSupplier,
};
