// src/context/GiftCardContext.tsx
import { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { GiftCard } from '../types/gift-card';
import { getUserCards } from '../services/cardService';
import { useAuth } from '../hooks/useAuth';
import { toastError } from '../lib/utils';

interface GiftCardContextType {
	giftCards: GiftCard[];
	loading: boolean;
	refetchCards: (query?: string) => void;
	updateCards: (cards: Partial<GiftCard>[]) => void;
}

export const GiftCardContext = createContext<GiftCardContextType | undefined>(
	undefined
);

export const GiftCardProvider = ({ children }: { children: ReactNode }) => {
	const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
	const { user, logout } = useAuth();
	const [loading, setLoading] = useState(true);
	const hasRun = useRef(false);

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
		if (user && !hasRun.current) {
			hasRun.current = true;
			fetchCards();
		}
	}, [user]);

	const refetchCards = () => {
		fetchCards();
	};

	const updateCards = (cards: Partial<GiftCard>[]) => {
		setGiftCards((prevCards) =>
			prevCards.map((card) => {
				const updatedCard = cards.find((c) => c._id === card._id);
				return updatedCard ? { ...card, ...updatedCard } : card;
			})
		);
	};

	return (
		<GiftCardContext.Provider
			value={{ giftCards, loading, refetchCards, updateCards }}
		>
			{children}
		</GiftCardContext.Provider>
	);
};
