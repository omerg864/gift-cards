import Card from '../models/cardModel';
import { CardDocument, Card as ICard } from '../types/card';
import { Supplier } from '../types/supplier';
import { UserDocument } from '../types/user';

const getUserCards = async (
	user: UserDocument,
	query: string
): Promise<CardDocument[]> => {
	const cards = await Card.find({ user: user._id }).populate('supplier');
	if (!query) {
		return cards;
	}
	const filteredCards = cards.filter((card) => {
		if (query) {
			const regex = new RegExp(query, 'i');
			return (
				card.name.match(regex) ||
				(card.supplier as Supplier).name.match(regex) ||
				card.description?.match(regex) ||
				(card.supplier as Supplier).stores.some((store) =>
					store.name.match(regex)
				)
			);
		}
		return true;
	});

	return filteredCards;
};

const newCard = async (
	user: UserDocument,
	data: Partial<ICard>
): Promise<CardDocument> => {
	const card = await Card.create({
		user: user._id,
		...data,
	});
	return card;
};

const updateCardById = async (
	user: UserDocument,
	id: string,
	data: Partial<ICard>
): Promise<CardDocument | null> => {
	const card = await Card.findOneAndUpdate(
		{ _id: id, user: user._id },
		data,
		{
			new: true,
			runValidators: true,
		}
	);
	return card;
};

const deleteCardById = async (
	user: UserDocument,
	id: string
): Promise<CardDocument | null> => {
	const card = await Card.findOneAndDelete({ _id: id, user: user._id });
	return card;
};

const updateAllCards = async (
	user: UserDocument,
	data: Partial<CardDocument>[]
): Promise<(CardDocument | null)[]> => {
	const promises = [];
	for (const cardData of data) {
		const card = await Card.findOneAndUpdate(
			{ _id: cardData._id, user: user._id },
			cardData,
			{
				new: true,
				runValidators: true,
			}
		);
		promises.push(card);
	}
	await Promise.all(promises);
	return promises;
};

const deleteCardsBySupplierId = async (
	user: UserDocument,
	supplierId: string
): Promise<CardDocument[]> => {
	const cards = await Card.find({ user: user._id, supplier: supplierId });
	const deletePromises = cards.map((card) => {
		return Card.findOneAndDelete({ _id: card._id, user: user._id });
	});
	await Promise.all(deletePromises);
	return cards;
};

const getCardsBetweenDates = async (
	endDate: Date,
	startDate: Date = new Date(),
	query: Object = {}
): Promise<CardDocument[]> => {
	const cards = await Card.find({
		expiry: {
			$gte: startDate,
			$lte: endDate,
		},
		...query,
	}).populate('user');
	if (!cards) {
		return [];
	}
	return cards;
};

export {
	getUserCards,
	newCard,
	updateCardById,
	deleteCardById,
	updateAllCards,
	deleteCardsBySupplierId,
	getCardsBetweenDates,
};
