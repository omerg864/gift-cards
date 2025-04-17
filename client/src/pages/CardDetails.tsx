'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
	Eye,
	EyeOff,
	Store,
	Calendar,
	CreditCard,
	DollarSign,
	ArrowLeft,
	Edit,
	Trash,
	ShoppingBag,
	Search,
	X,
	Smartphone,
	FileText,
} from 'lucide-react';
import type { CreateGiftCardDetails, GiftCard } from '../types/gift-card';
import { Store as IStore, Supplier } from '../types/supplier';
import { getCurrencySymbol } from '../types/gift-card';
import { useNavigate, useParams } from 'react-router';
import { GiftCardItem } from '../components/GiftCardItem';
import { useGiftCards } from '../hooks/useGiftCards';
import Loading from '../components/loading';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { toast } from 'react-toastify';
import {
	deleteCard,
	updateCard,
	updateCardWithNewSupplier,
} from '../services/cardService';
import { toastError } from '../lib/utils';

export default function CardDetailsPage() {
	const navigate = useNavigate();
	const params = useParams();
	const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
	const [loading, setLoading] = useState(true);
	const [showCVV, setShowCVV] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [storeFilter, setStoreFilter] = useState('');
	const [filteredStores, setFilteredStores] = useState<IStore[]>([]);
	const {
		giftCards,
		loading: giftCardLoading,
		refetchCards,
	} = useGiftCards();

	useEffect(() => {
		const fetchGiftCard = async () => {
			if (params.id) {
				const card = giftCards.find((card) => card._id === params.id);
				if (card) {
					setGiftCard(card);
					setFilteredStores((card.supplier as Supplier).stores);
				} else {
					setGiftCard(null);
				}
			}
			setLoading(false);
		};

		fetchGiftCard();
	}, [params.id, giftCards]);

	useEffect(() => {
		if (giftCard) {
			if (storeFilter.trim() === '') {
				setFilteredStores((giftCard.supplier as Supplier).stores);
			} else {
				const filtered = (giftCard.supplier as Supplier).stores.filter(
					(store) =>
						store.name
							.toLowerCase()
							.includes(storeFilter.toLowerCase())
				);
				setFilteredStores(filtered);
			}
		}
	}, [storeFilter, giftCard]);

	const toggleCVV = () => {
		setShowCVV(!showCVV);
	};

	const handleEdit = () => {
		setShowEditDialog(true);
	};

	const handleDelete = async () => {
		if (confirm('Are you sure you want to delete this gift card?')) {
			try {
				await deleteCard(params.id as string);
				refetchCards();
				navigate('/');
				toast.success('Card deleted successfully');
			} catch (error) {
				toastError(error);
			}
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	const handleUpdateCard = async (data: CreateGiftCardDetails) => {
		console.log('Updated card data:', data);
		if (!data) {
			toast.error('No data provided');
			return;
		}
		if (isNaN(data.amount) || data.amount <= 0) {
			toast.error('Amount must be greater than 0');
			return;
		}
		if (!data.name || !data.supplierId) {
			toast.error('Name and Supplier are required');
			return;
		}
		try {
			if (data.supplierId === 'other') {
				await updateCardWithNewSupplier(
					params.id as string,
					data.name,
					data.supplier as string,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency,
					data.supportedStores.map((store) => ({
						name: store,
					})),
					null,
					[]
				);
			} else {
				await updateCard(
					params.id as string,
					data.name,
					data.supplierId,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency
				);
			}
			refetchCards();
			setShowEditDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
			toastError(error);
		}
	};

	const clearStoreFilter = () => {
		setStoreFilter('');
	};

	if (loading || giftCardLoading) {
		return <Loading />;
	}

	if (!giftCard) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Button variant="outline" onClick={handleBack} className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold mb-2">
						Gift Card Not Found
					</h2>
					<p className="text-muted-foreground">
						The gift card you're looking for doesn't exist or has
						been deleted.
					</p>
				</div>
			</div>
		);
	}

	// Get currency symbol
	const currencySymbol = getCurrencySymbol(giftCard.currency);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<Button variant="outline" onClick={handleBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Cards
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleEdit}>
						<Edit className="mr-2 h-4 w-4" /> Edit
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					{/* Card preview - Matching the home page card layout */}
					<div className="mb-3">
						<GiftCardItem giftCard={giftCard} />
					</div>

					{/* Card information */}
					<div className="space-y-4 bg-muted/30 p-6 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">
							Card Details
						</h2>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Amount
									</div>
									<div className="font-medium">
										{currencySymbol}
										{giftCard.amount}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{giftCard.isPhysical ? (
									<CreditCard className="h-5 w-5 text-muted-foreground" />
								) : (
									<Smartphone className="h-5 w-5 text-muted-foreground" />
								)}
								<div>
									<div className="text-sm text-muted-foreground">
										Card Type
									</div>
									<div className="font-medium">
										{giftCard.isPhysical
											? 'Physical Card'
											: 'Digital Card'}
									</div>
								</div>
							</div>
						</div>

						{giftCard.description && (
							<div className="flex items-start gap-2 mt-4 bg-background p-3 rounded-lg border">
								<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<div className="text-sm text-muted-foreground">
										Description
									</div>
									<div className="mt-1">
										{giftCard.description}
									</div>
								</div>
							</div>
						)}

						{giftCard.expirationMonth &&
							giftCard.expirationYear && (
								<div className="flex items-center gap-2">
									<Calendar className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="text-sm text-muted-foreground">
											Expires
										</div>
										<div className="font-medium">
											{giftCard.expirationMonth < 10
												? `0${giftCard.expirationMonth}`
												: giftCard.expirationMonth}
											/{giftCard.expirationYear}
										</div>
									</div>
								</div>
							)}

						{giftCard.cardNumber && (
							<div className="flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Card Number
									</div>
									<div className="font-medium font-mono">
										{giftCard.cardNumber}
									</div>
								</div>
							</div>
						)}

						{giftCard.cvv && (
							<div className="flex items-center gap-2">
								<button
									onClick={toggleCVV}
									className="h-5 w-5 text-muted-foreground"
								>
									{showCVV ? <EyeOff /> : <Eye />}
								</button>
								<div>
									<div className="text-sm text-muted-foreground">
										CVV
									</div>
									<div className="font-medium">
										{showCVV ? giftCard.cvv : '•••'}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<div>
					{/* Supported stores with search/filter */}
					<div className="bg-muted/30 p-6 rounded-lg">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold flex items-center">
								<Store className="mr-2 h-5 w-5" /> Supported
								Stores
							</h2>
							<div className="text-sm text-muted-foreground">
								{filteredStores.length} of{' '}
								{(giftCard.supplier as Supplier).stores.length}{' '}
								stores
							</div>
						</div>

						{/* Search input for stores */}
						<div className="relative mb-4">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search stores..."
								value={storeFilter}
								onChange={(e) => setStoreFilter(e.target.value)}
								className="pl-9 pr-8"
							/>
							{storeFilter && (
								<button
									onClick={clearStoreFilter}
									className="absolute right-3 top-1/2 transform -translate-y-1/2"
								>
									<X className="h-4 w-4 text-muted-foreground" />
								</button>
							)}
						</div>

						<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
							{filteredStores.length > 0 ? (
								filteredStores.map((store, index) => (
									<div
										key={index}
										className="flex items-center gap-4 p-3 bg-background rounded-lg border"
									>
										<img
											src={store.image || '/store.png'}
											alt={store.name}
											width={40}
											height={40}
											className="rounded-md"
										/>
										<div>
											<div className="font-medium">
												{store.name}
											</div>
											<div className="text-sm text-muted-foreground flex items-center">
												<ShoppingBag className="h-3 w-3 mr-1" />
												Accepts{' '}
												{
													(
														giftCard.supplier as Supplier
													).name
												}{' '}
												gift cards
											</div>
										</div>
									</div>
								))
							) : storeFilter ? (
								<div className="text-center py-8 text-muted-foreground">
									No stores match your search "{storeFilter}"
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No stores specified for this gift card
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{showEditDialog && (
				<GiftCardDialog
					giftCard={giftCard}
					onClose={() => setShowEditDialog(false)}
					onSubmit={handleUpdateCard}
				/>
			)}
		</div>
	);
}
