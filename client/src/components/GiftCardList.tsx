'use client';

import { Supplier } from '@shared/types/supplier.types';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetCards } from '../hooks/useCardQuery';
import { useGetSuppliers } from '../hooks/useSupplierQuery';
import type { GiftCard } from '../types/gift-card';
import { GiftCardItem } from './GiftCardItem';
import Loading from './loading';
import { SupplierCard } from './SupplierCard';

export function GiftCardList() {
	const navigate = useNavigate();
	const { data: cards, isLoading: loading, refetch, isRefetching } = useGetCards();
	const { data: suppliers, isLoading: loadingSuppliers } = useGetSuppliers();
	const [filteredCards, setFilteredCards] = useState<GiftCard[]>(
		cards?.filter((card) => card.supplier) ?? []
	);
	const [supplierCards, setSupplierCards] = useState<Supplier[]>([]);
	const [searchParams] = useSearchParams();
	const searchQuery = searchParams.get('q') || '';

	const handleSupplierClick = (supplierId: string) => {
		navigate(`/supplier/${supplierId}`);
	};

	const handleGiftCardClick = (id: string) => {
		navigate(`/card/${id}`);
	};

	useEffect(() => {
		if (searchQuery) {
			const regex = new RegExp(searchQuery, 'i');
			const filtered = cards
				?.filter((card) => card.supplier)
				.filter(
					(card) => {
						const cardSupplier = suppliers?.find(
							(s) => s.id === card.supplier
						);
						return (
							card.name.match(regex) ||
							cardSupplier?.name.match(regex) ||
							card.description?.match(regex) ||
							(cardSupplier?.stores ?? []).some((store) =>
								store.name.match(regex)
							)
						);
					}
				);
			const suppliersFiltered = suppliers?.filter(
				(supplier) =>
					supplier.name.match(regex) ||
					(supplier.stores ?? []).some((store) => store.name.match(regex))
			);
			setSupplierCards(suppliersFiltered ?? []);
			setFilteredCards(filtered ?? []);
		} else {
			setFilteredCards(cards?.filter((card) => card.supplier) ?? []);
		}
	}, [searchQuery, cards, suppliers]);

	if (loading || loadingSuppliers) {
		return <Loading />;
	}

	return (
		<div className="space-y-8">
			<div>
				<div className="flex items-center gap-4 mb-6">
					<h2 className="text-2xl font-semibold">Your Gift Cards</h2>
					<button
						onClick={() => refetch()}
						className="p-2 hover:bg-white/10 rounded-full transition-colors"
						title="Refresh cards"
					>
						<RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
					</button>
				</div>
				{filteredCards.length > 0 ? (
					<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
						{filteredCards
							.filter((card) => card.supplier)
							.map((card) => {
								const cardSupplier = suppliers?.find(
									(s) => s.id === card.supplier
								);
								return (
									<GiftCardItem
										handleCardClick={handleGiftCardClick}
										key={card.id}
										giftCard={card}
										supplier={cardSupplier}
									/>
								);
							})}
					</div>
				) : (
					<div className="bg-white/5 p-6 rounded-lg text-center">
						<p className="text-white/70">
							No gift cards found. Add your first gift card!
						</p>
					</div>
				)}
			</div>

			{searchQuery && supplierCards.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold mb-6">
						Other Suppliers Gift Cards
					</h2>
					<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
						{supplierCards.map((supplier) => (
							<SupplierCard
								handleCardClick={handleSupplierClick}
								key={supplier.id}
								supplier={supplier}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
