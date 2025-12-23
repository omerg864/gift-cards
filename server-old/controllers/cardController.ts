import asyncHandler from 'express-async-handler';
import {
	deleteCardById,
	getCardsBetweenDates,
	getUserCards,
	newCard,
	updateCardById,
} from '../services/cardService';
import { newUserSupplier } from '../services/supplierService';
import { getAllUsersSettings } from '../services/settingsService';
import { sendEmail } from '../utils/functions';
import { UserDocument } from '../types/user';
import { ObjectId } from 'mongoose';

const getCards = asyncHandler(async (req, res) => {
	const user = req.user!;
	const { query } = req.query;
	const cards = await getUserCards(user, query as string);
	res.status(200).json({
		success: true,
		cards,
	});
});

const createCardAndSupplier = asyncHandler(async (req, res) => {
	const user = req.user!;
	const {
		name,
		supplierName,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
		fromColor,
		toColor,
	} = req.body;

	let { stores = '[]' } = req.body;
	stores = JSON.parse(stores);

	if (
		!supplierName ||
		!name ||
		isNaN(amount) ||
		!currency ||
		!fromColor ||
		!toColor
	) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const newSupplier = await newUserSupplier(
		undefined,
		supplierName,
		'',
		undefined,
		stores,
		fromColor,
		toColor,
		user
	);

	if (!newSupplier) {
		res.status(400);
		throw new Error('Error creating supplier');
	}

	const card = await newCard(user, {
		name,
		supplier: newSupplier.id,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	});

	if (!card) {
		res.status(400);
		throw new Error('Error creating card');
	}
	res.status(201).json({
		success: true,
		card,
		supplier: newSupplier,
	});
});

const createCard = asyncHandler(async (req, res) => {
	const user = req.user!;
	const {
		name,
		supplier,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	} = req.body;

	if (!supplier || !name || isNaN(amount) || !currency) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const card = await newCard(user, {
		name,
		supplier,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	});

	if (!card) {
		res.status(400);
		throw new Error('Error creating card');
	}

	res.status(201).json({
		success: true,
		card,
	});
});

const updateCardWithNewSupplier = asyncHandler(async (req, res) => {
	const user = req.user!;
	const cardId = req.params.id;
	const {
		name,
		supplierName,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
		fromColor,
		toColor,
	} = req.body;

	let { stores = '[]' } = req.body;
	stores = JSON.parse(stores);

	if (
		!supplierName ||
		!name ||
		isNaN(amount) ||
		!currency ||
		!fromColor ||
		!toColor
	) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const newSupplier = await newUserSupplier(
		undefined,
		supplierName,
		'',
		undefined,
		stores,
		fromColor,
		toColor,
		user
	);

	if (!newSupplier) {
		res.status(400);
		throw new Error('Error creating supplier');
	}

	const card = await updateCardById(user, cardId, {
		name,
		supplier: newSupplier.id,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	});

	if (!card) {
		res.status(400);
		throw new Error('Error updating card');
	}

	res.status(200).json({
		success: true,
		card,
		supplier: newSupplier,
	});
});

const updateCard = asyncHandler(async (req, res) => {
	const user = req.user!;
	const cardId = req.params.id;
	const {
		name,
		supplier,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	} = req.body;
	if (!supplier || !name || isNaN(amount) || !currency) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const card = await updateCardById(user, cardId, {
		name,
		supplier,
		description,
		isPhysical,
		amount,
		currency,
		cardNumber,
		cvv,
		last4,
		expiry,
	});

	if (!card) {
		res.status(400);
		throw new Error('Error updating card');
	}

	res.status(200).json({
		success: true,
		card,
	});
});

const deleteCard = asyncHandler(async (req, res) => {
	const user = req.user!;
	const cardId = req.params.id;

	if (!cardId) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const card = await deleteCardById(user, cardId);

	if (!card) {
		res.status(400);
		throw new Error('Error deleting card');
	}

	res.status(200).json({
		success: true,
		card,
	});
});

const emailMonthNotification = asyncHandler(async (req, res) => {
	const usersSettings = await getAllUsersSettings();
	const now = new Date();
	const oneMonthFromNow = new Date();
	oneMonthFromNow.setMonth(now.getMonth() + 1);
	const twoMonthFromNow = new Date();
	twoMonthFromNow.setMonth(now.getMonth() + 2);
	const cards1Month = await getCardsBetweenDates(oneMonthFromNow, now, {
		notified1Month: false,
	});
	const cards2Month = await getCardsBetweenDates(
		twoMonthFromNow,
		oneMonthFromNow,
		{
			notified2Month: false,
		}
	);
	for (const card of cards1Month) {
		const notify = usersSettings.find(
			(userSetting) =>
				userSetting.user.toString() ===
				((card.user as UserDocument)._id as ObjectId).toString()
		)?.email1MonthNotification;
		if (notify) {
			const month1Html = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #000;
						color: #fff;
						padding: 20px;
					}
					.container {
						background-color: #1a1a1a;
						border: 1px solid #333;
						border-radius: 8px;
						padding: 20px;
						max-width: 600px;
						margin: 0 auto;
					}
					.header {
						text-align: center;
						color: #3b82f6;
						font-size: 24px;
						margin-bottom: 20px;
					}
					.content {
						color: #fff;
						font-size: 16px;
						line-height: 1.5;
					}
					.card-name {
						color: #3b82f6;
						font-weight: bold;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						font-size: 14px;
						color: #666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">Card Expiration Notice</div>
					<div class="content">
						<p>Dear User,</p>
						<p>
							This is a friendly reminder that your card 
							<span class="card-name">${card.name}</span> 
							is set to expire in one month.
						</p>
						<p>Please take the necessary actions to renew or replace your card to avoid any inconvenience.</p>
					</div>
					<div class="footer">
						<p>Thank you for using our service!</p>
					</div>
				</div>
			</body>
			</html>
		`;
			sendEmail(
				(card.user as UserDocument).email,
				'Card Expiration',
				`Your card (${card.name}) is expiring in 1 month`,
				month1Html
			);
			card.notified1Month = true;
			await card.save();
		}
	}
	for (const card of cards2Month) {
		const notify = usersSettings.find(
			(userSetting) =>
				userSetting.user.toString() ===
				((card.user as UserDocument)._id as ObjectId).toString()
		)?.email2MonthNotification;
		if (notify) {
			const month2Html = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #000;
						color: #fff;
						padding: 20px;
					}
					.container {
						background-color: #1a1a1a;
						border: 1px solid #333;
						border-radius: 8px;
						padding: 20px;
						max-width: 600px;
						margin: 0 auto;
					}
					.header {
						text-align: center;
						color: #3b82f6;
						font-size: 24px;
						margin-bottom: 20px;
					}
					.content {
						color: #fff;
						font-size: 16px;
						line-height: 1.5;
					}
					.card-name {
						color: #3b82f6;
						font-weight: bold;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						font-size: 14px;
						color: #666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">Card Expiration Notice</div>
					<div class="content">
						<p>Dear User,</p>
						<p>
							This is a friendly reminder that your card 
							<span class="card-name">${card.name}</span> 
							is set to expire in two month.
						</p>
						<p>Please take the necessary actions to renew or replace your card to avoid any inconvenience.</p>
					</div>
					<div class="footer">
						<p>Thank you for using our service!</p>
					</div>
				</div>
			</body>
			</html>
		`;
			sendEmail(
				(card.user as UserDocument).email,
				'Card Expiration',
				`Your card (${card.name}) is expiring in 2 month`,
				month2Html
			);
			card.notified2Month = true;
			await card.save();
		}
	}
	res.status(200).json({
		success: true,
	});
});

export {
	getCards,
	createCardAndSupplier,
	createCard,
	updateCard,
	deleteCard,
	updateCardWithNewSupplier,
	emailMonthNotification,
};
