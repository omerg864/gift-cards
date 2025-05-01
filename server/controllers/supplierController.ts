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
import { buyMeGiftCardsList, loveCardGiftCardsList, maxGiftCardList } from '../utils/constants';
import { Supplier } from '../types/supplier';
import { getDarkerColor } from '../utils/colors';

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
	}
	if (buyMeSuppliers.length === 0) {
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
	}
	if (loveCardSuppliers.length === 0) {
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
	}
	if (maxGiftCardSuppliers.length === 0) {
		res.status(404);
		throw new Error('No suppliers found');
	}
	upsertSuppliers(maxGiftCardSuppliers);
	res.status(200).json({
		success: true,
		maxGiftCardSuppliers,
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
	scrapeMaxGiftCardSupplier
};
