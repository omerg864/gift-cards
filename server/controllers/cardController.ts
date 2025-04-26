import asyncHandler from 'express-async-handler';
import {
	deleteCardById,
	getUserCards,
	newCard,
	updateCardById,
} from '../services/cardService';
import { newUserSupplier } from '../services/supplierService';

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

export {
	getCards,
	createCardAndSupplier,
	createCard,
	updateCard,
	deleteCard,
	updateCardWithNewSupplier,
};
