'use client';

import { useState, useEffect } from 'react';
import type { GiftCard } from '../../types/gift-card';
import { GiftCardItem } from '../components/gift-card-item';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function GiftCardList() {
	const navigate = useNavigate();
	const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
	const [otherCards, setOtherCards] = useState<GiftCard[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchParams] = useSearchParams();
	const searchQuery = searchParams.get('q') || '';

	useEffect(() => {
		// In a real app, this would be an API call
		const fetchGiftCards = () => {
			setLoading(true);

			// Simulate API call with mock data
			setTimeout(() => {
				const mockUserCards: GiftCard[] = [
					{
						id: '1',
						supplier: 'Amazon',
						supplierId: 'amazon',
						cardNumber: '1234 5678 9012 3456',
						expirationDate: '12/2025',
						amount: 100,
						currency: 'ILS',
						description:
							"Gift card for my nephew's birthday. Can be used for online purchases on Amazon.",
						cvv: '123',
						supportedStores: [
							'Amazon',
							'Amazon Fresh',
							'Whole Foods',
						],
						isPhysical: true,
					},
					{
						id: '2',
						supplier: 'Starbucks',
						supplierId: 'starbucks',
						cardNumber: '8765 4321 9876 5432',
						expirationDate: '06/2024',
						amount: 25,
						currency: 'USD',
						description:
							'Coffee gift card for Sarah. Perfect for her morning coffee runs.',
						cvv: '456',
						supportedStores: ['Starbucks', 'Starbucks Reserve'],
						isPhysical: false,
					},
					{
						id: '3',
						supplier: 'Target',
						supplierId: 'target',
						cardNumber: '9876 5432 1098 7654',
						expirationDate: '03/2026',
						amount: 50,
						currency: 'ILS',
						description: 'Housewarming gift for David and Emma.',
						cvv: '789',
						supportedStores: ['Target', 'Target Online', 'Shipt'],
						isPhysical: true,
					},
					{
						id: '4',
						supplier: 'Visa Gift Card',
						supplierId: 'visa',
						amount: 75,
						currency: 'EUR',
						description:
							'Universal gift card that can be used at most retailers.',
						supportedStores: [
							'Walmart',
							'Best Buy',
							'Target',
							'Amazon',
							'Most Retailers',
						],
						isPhysical: false,
					},
				];

				const mockOtherCards: GiftCard[] = [
					{
						id: '5',
						supplier: 'Amazon',
						supplierId: 'amazon',
						amount: 50,
						currency: 'ILS',
						description: 'Amazon gift card with free shipping.',
						supportedStores: [
							'Amazon',
							'Amazon Fresh',
							'Whole Foods',
						],
						isPhysical: true,
					},
					{
						id: '6',
						supplier: 'Walmart',
						supplierId: 'walmart',
						amount: 100,
						currency: 'ILS',
						description:
							'Walmart gift card for everyday essentials.',
						supportedStores: [
							'Walmart',
							'Walmart.com',
							"Sam's Club",
						],
						isPhysical: false,
					},
					{
						id: '7',
						supplier: 'Best Buy',
						supplierId: 'bestbuy',
						amount: 200,
						currency: 'ILS',
						description:
							'Best Buy gift card for electronics and gadgets.',
						supportedStores: ['Best Buy', 'Best Buy Online'],
						isPhysical: true,
					},
					{
						id: '8',
						supplier: 'Netflix',
						supplierId: 'netflix',
						amount: 25,
						currency: 'ILS',
						description: 'Netflix subscription gift card.',
						supportedStores: ['Netflix'],
						isPhysical: false,
					},
				];

				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					// Search through supported stores instead of supplier names
					setGiftCards(
						mockUserCards.filter((card) =>
							card.supportedStores.some((store) =>
								store.toLowerCase().includes(query)
							)
						)
					);
					setOtherCards(
						mockOtherCards.filter((card) =>
							card.supportedStores.some((store) =>
								store.toLowerCase().includes(query)
							)
						)
					);
				} else {
					setGiftCards(mockUserCards);
					setOtherCards([]);
				}

				setLoading(false);
			}, 500);
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
		return (
			<div className="flex justify-center items-center h-40">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
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
								key={card.id}
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
								key={card.id}
								giftCard={card}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
