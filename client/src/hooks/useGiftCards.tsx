import { useContext } from 'react';
import { GiftCardContext } from '../context/GiftCardContext';

export const useGiftCards = () => {
	const context = useContext(GiftCardContext);
	if (!context) {
		throw new Error('useGiftCards must be used within a GiftCardProvider');
	}
	return context;
};
