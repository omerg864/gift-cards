'use client';

import { useState, useEffect } from 'react';
import type { GiftCard } from '../types/gift-card';
import { GiftCardItem } from '../components/gift-card-item';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './loading';
import { getUserCards } from '../services/cardService';
import { toastError } from '../lib/utils';

export function GiftCardList() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
	const [otherCards, setOtherCards] = useState<GiftCard[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchParams] = useSearchParams();
	const searchQuery = searchParams.get('q') || '';

	useEffect(() => {
		// In a real app, this would be an API call
		const fetchGiftCards = async () => {
			setLoading(true);

			try {
				const data = await getUserCards(searchQuery);

				setGiftCards(data.cards);
			} catch (error) {
				if ((error as Error).message === 'Please login') {
					logout();
					navigate('/login');
					return;
				}
				toastError(error);
			}

			setLoading(false);
		};

		fetchGiftCards();
	}, [searchQuery]);

	const handleSupplierClick = (supplierId: string) => {
		navigate(`/supplier/${supplierId}`);
	};

	const handleGiftCardClick = (id: string) => {
		navigate(`/card/${id}`);
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-semibold mb-6">Your Gift Cards</h2>
				{giftCards.length > 0 ? (
					<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
						{giftCards.map((card) => (
							<GiftCardItem
								handleCardClick={handleGiftCardClick}
								key={card._id}
								giftCard={card}
							/>
						))}
					</div>
				) : (
					<div className="bg-white/5 p-6 rounded-lg text-center">
						<p className="text-white/70">
							No gift cards found. Add your first gift card!
						</p>
					</div>
				)}
			</div>

			{searchQuery && otherCards.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold mb-6">
						Other Available Gift Cards
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{otherCards.map((card) => (
							<GiftCardItem
								supplierCard={true}
								handleCardClick={handleSupplierClick}
								key={card._id}
								giftCard={card}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
