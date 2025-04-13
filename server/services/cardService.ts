import Card from '../models/cardModel';
import { CardDocument, Card as ICard } from '../types/card';
import { UserDocument } from '../types/user';

const getUserCards = async (user: UserDocument): Promise<CardDocument[]> => {
	const cards = await Card.find({ user: user._id }).populate('supplier');
	return cards;
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

export { getUserCards, newCard, updateCardById, deleteCardById };
