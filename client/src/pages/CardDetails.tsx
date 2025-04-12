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
import type { GiftCard } from '../../types/gift-card';
import { getSupplierByName } from '../../types/supplier';
import { getCurrencySymbol } from '../../types/gift-card';
import { EditGiftCardDialog } from '../components/edit-gift-card-dialog';
import { useNavigate, useParams } from 'react-router';
import { GiftCardItem } from '../components/gift-card-item';

export default function CardDetailsPage() {
	const navigate = useNavigate();
	const params = useParams();
	const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
	const [loading, setLoading] = useState(true);
	const [showCVV, setShowCVV] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [storeFilter, setStoreFilter] = useState('');
	const [filteredStores, setFilteredStores] = useState<string[]>([]);

	useEffect(() => {
		// In a real app, this would be an API call to fetch the specific card
		const fetchGiftCard = () => {
			setLoading(true);

			// Simulate API call with mock data
			setTimeout(() => {
				const mockCards: GiftCard[] = [
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

				const card = mockCards.find((card) => card.id === params.id);
				setGiftCard(card || null);
				if (card) {
					setFilteredStores(card.supportedStores);
				}
				setLoading(false);
			}, 500);
		};

		fetchGiftCard();
	}, [params.id]);

	useEffect(() => {
		if (giftCard) {
			if (storeFilter.trim() === '') {
				setFilteredStores(giftCard.supportedStores);
			} else {
				const filtered = giftCard.supportedStores.filter((store) =>
					store.toLowerCase().includes(storeFilter.toLowerCase())
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

	const handleDelete = () => {
		if (confirm('Are you sure you want to delete this gift card?')) {
			// In a real app, this would be an API call to delete the card
			navigate('/');
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	const handleUpdateCard = (updatedCard: GiftCard) => {
		// In a real app, this would be an API call to update the card
		setGiftCard(updatedCard);
		setFilteredStores(updatedCard.supportedStores);
		setShowEditDialog(false);
	};

	const clearStoreFilter = () => {
		setStoreFilter('');
	};

	// Store images mapping (in a real app, these would be actual store logos)
	const getStoreImage = (storeName: string) => {
		const storeMap: Record<string, string> = {
			Amazon: '/placeholder.svg?height=40&width=40',
			'Amazon Fresh': '/placeholder.svg?height=40&width=40',
			'Whole Foods': '/placeholder.svg?height=40&width=40',
			Starbucks: '/placeholder.svg?height=40&width=40',
			'Starbucks Reserve': '/placeholder.svg?height=40&width=40',
			Target: '/placeholder.svg?height=40&width=40',
			'Target Online': '/placeholder.svg?height=40&width=40',
			Shipt: '/placeholder.svg?height=40&width=40',
			Walmart: '/placeholder.svg?height=40&width=40',
			'Walmart.com': '/placeholder.svg?height=40&width=40',
			"Sam's Club": '/placeholder.svg?height=40&width=40',
			'Best Buy': '/placeholder.svg?height=40&width=40',
			'Best Buy Online': '/placeholder.svg?height=40&width=40',
			Netflix: '/placeholder.svg?height=40&width=40',
			'Most Retailers': '/placeholder.svg?height=40&width=40',
		};

		return storeMap[storeName] || '/placeholder.svg?height=40&width=40';
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-40">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			</div>
		);
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

	// Get the supplier color based on the supplier name
	const supplier = getSupplierByName(giftCard.supplier);

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

						{giftCard.expirationDate && (
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Expires
									</div>
									<div className="font-medium">
										{giftCard.expirationDate}
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
								{giftCard.supportedStores.length} stores
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
											src={
												getStoreImage(store) ||
												'/placeholder.svg'
											}
											alt={store}
											width={40}
											height={40}
											className="rounded-md"
										/>
										<div>
											<div className="font-medium">
												{store}
											</div>
											<div className="text-sm text-muted-foreground flex items-center">
												<ShoppingBag className="h-3 w-3 mr-1" />
												Accepts {giftCard.supplier} gift
												cards
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
				<EditGiftCardDialog
					giftCard={giftCard}
					onUpdate={handleUpdateCard}
					onClose={() => setShowEditDialog(false)}
				/>
			)}
		</div>
	);
}
