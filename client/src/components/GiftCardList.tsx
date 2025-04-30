'use client';

import { useEffect, useState } from 'react';
import type { GiftCard } from '../types/gift-card';
import { GiftCardItem } from './GiftCardItem';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from './loading';
import { useGiftCards } from '../hooks/useGiftCards';
import { Supplier } from '../types/supplier';
import { useSupplier } from '../hooks/useSupplier';
import { SupplierCard } from './SupplierCard';

export function GiftCardList() {
	const navigate = useNavigate();
	const { giftCards, loading } = useGiftCards();
	const { suppliers, loading: loadingSuppliers } = useSupplier();
	const [filteredCards, setFilteredCards] = useState<GiftCard[]>(
		giftCards.filter((card) => card.supplier)
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
			const filtered = giftCards
				.filter((card) => card.supplier)
				.filter(
					(card) =>
						card.name.match(regex) ||
						(card.supplier as Supplier).name.match(regex) ||
						card.description?.match(regex) ||
						(card.supplier as Supplier).stores.some((store) =>
							store.name.match(regex)
						)
				);
			const suppliersFiltered = suppliers.filter(
				(supplier) =>
					supplier.name.match(regex) ||
					supplier.stores.some((store) => store.name.match(regex))
			);
			setSupplierCards(suppliersFiltered);
			setFilteredCards(filtered);
		} else {
			setFilteredCards(giftCards.filter((card) => card.supplier));
		}
	}, [searchQuery, giftCards, suppliers]);

	if (loading || loadingSuppliers) {
		return <Loading />;
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-2xl font-semibold mb-6">Your Gift Cards</h2>
				{filteredCards.length > 0 ? (
					<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
						{filteredCards
							.filter((card) => card.supplier)
							.map((card) => (
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

			{searchQuery && supplierCards.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold mb-6">
						Other Suppliers Gift Cards
					</h2>
					<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
						{supplierCards.map((supplier) => (
							<SupplierCard
								handleCardClick={handleSupplierClick}
								key={supplier._id}
								supplier={supplier}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
