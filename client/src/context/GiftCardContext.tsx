// src/context/GiftCardContext.tsx
import { createContext, useState, ReactNode, useEffect } from 'react';
import type { GiftCard } from '../types/gift-card';
import { getUserCards } from '../services/cardService';
import { useAuth } from '../hooks/useAuth';
import { toastError } from '../lib/utils';

interface GiftCardContextType {
	giftCards: GiftCard[];
	loading: boolean;
	refetchCards: (query?: string) => void;
}

export const GiftCardContext = createContext<GiftCardContextType | undefined>(
	undefined
);

export const GiftCardProvider = ({ children }: { children: ReactNode }) => {
	const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const { logout } = useAuth();

	const fetchCards = async () => {
		setLoading(true);
		try {
			const data = await getUserCards('');
			setGiftCards(data.cards);
		} catch (error) {
			if ((error as Error).message === 'Please login') {
				logout();
				setLoading(false);
				return;
			}
			toastError(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (user) {
			fetchCards();
		}
	}, [user]);

	const refetchCards = () => {
		fetchCards();
	};

	return (
		<GiftCardContext.Provider value={{ giftCards, loading, refetchCards }}>
			{children}
		</GiftCardContext.Provider>
	);
};
