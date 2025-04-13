import Card from '../models/cardModel';
import { UserDocument } from '../types/user';

const getUserCards = async (user: UserDocument) => {
	const cards = await Card.find({ user: user._id }).populate('supplier');

	return cards;
};


export { getUserCards };