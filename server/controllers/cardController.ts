import asyncHandler from 'express-async-handler';
import Card from '../models/cardModel';
import { getUserCards } from '../services/cardService';

const getCards = asyncHandler(async (req, res) => {
	const user = req.user!;
	const cards = await getUserCards(user);
	res.status(200).json({
		success: true,
		cards,
	});
});

const createCardAndSupplier = asyncHandler(async (req, res) => {
	const user = req.user!;
	const {
		name,
		supplier,
		stores,
		description,
		physicalCard,
		amount,
		currency,
	} = req.body;
});

const createCard = asyncHandler(async (req, res) => {
	const user = req.user!;
	const {
		name,
		supplier,
		stores,
		description,
		physicalCard,
		amount,
		currency,
	} = req.body;
});

export { getCards };
