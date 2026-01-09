'use client';

import { useGetSupplier } from '@/hooks/useSupplierQuery';
import { Supplier, SupplierStore } from '@shared/types/supplier.types';
import {
	ArrowLeft,
	Calendar,
	Copy,
	CreditCard,
	DollarSign,
	Edit,
	Eye,
	EyeOff,
	FileText,
	Search,
	Smartphone,
	Store,
	Trash,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Card } from '../../../shared/types/card.types';
import ConfirmationDialog from '../components/ConfirmationDialog';
import EncryptionDialog from '../components/EncryptionDialog';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { GiftCardItem } from '../components/GiftCardItem';
import Loading from '../components/loading';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEncryption } from '../context/EncryptionContext';
import {
	useDeleteCard,
	useGetCard,
	useUpdateCardWithNewSupplier,
} from '../hooks/useCardQuery';
import {
	decryptCardFields,
	encryptCard,
	validateGlobalKey,
} from '../lib/cryptoHelpers';
import { getCloudinaryUrl, toastError } from '../lib/utils';
import { useAuthStore } from '../stores/useAuthStore';
import { getCurrencySymbol } from '../types/gift-card';

export default function CardDetailsPage() {
	const navigate = useNavigate();
	const params = useParams();
	const [loading, setLoading] = useState(false);
	const [showEncryptedData, setShowEncryptedData] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [storeFilter, setStoreFilter] = useState('');
	const [filteredStores, setFilteredStores] = useState<SupplierStore[]>([]);
	const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
	const [cvv, setCvv] = useState<string>('');
	const [cardNumber, setCardNumber] = useState<string>('');
	const {
		data: card,
		isLoading: giftCardLoading,
	} = useGetCard(params.id as string);
	const { user } = useAuthStore();
	const { globalKey, setGlobalKey } = useEncryption();

	const { mutateAsync: deleteCardMutation, isPending: isDeletingCard } = useDeleteCard();
	const updateCardWithNewSupplierMutation = useUpdateCardWithNewSupplier();
	
	const { data: supplier, isLoading: supplierLoading } = useGetSupplier(card?.supplier ?? '', {
		enabled: !!card?.supplier,
	});

	useEffect(() => {
		if (supplier) {
			if (storeFilter.trim() === '') {
				setFilteredStores(supplier.stores ?? []);
			} else {
				const filtered = (supplier.stores ?? []).filter(
					(store) =>
						store.name
							.toLowerCase()
							.includes(storeFilter.toLowerCase())
				);
				setFilteredStores(filtered);
			}
		}
	}, [storeFilter, supplier]);

	const decryptData = (key: string) => {
		const decryptedData = decryptCardFields(
			{
				cardNumber: card?.cardNumber,
				cvv: card?.cvv,
			},
			key,
			user!.salt!
		);
		setCvv(decryptedData.cvv);
		setCardNumber(decryptedData.cardNumber);
		setShowEncryptedData(!showEncryptedData);
	};

	const toggleEncryptedData = () => {
		if (!user) {
			toast.error('Unable to perform encryption');
			return;
		}
		if (!user.salt || !user.verifyToken) {
			toast.error('Unable to perform encryption');
			return;
		}
		if (!globalKey) {
			setShowEncryptionDialog(true);
			return;
		}
		if (!validateGlobalKey(user.verifyToken, globalKey, user.salt)) {
			setGlobalKey('');
			setShowEncryptionDialog(true);
			return;
		}
		if (showEncryptedData) {
			setCvv('');
			setCardNumber('');
			setShowEncryptedData(!showEncryptedData);
			return;
		}
		decryptData(globalKey);
	};

	const handleEdit = () => {
		setShowEditDialog(true);
	};

	const handleDelete = async () => {
		try {
			await deleteCardMutation(params.id as string);
			navigate('/');
			setShowConfirmationDialog(false);
			toast.success('Card deleted successfully');
		} catch (error) {
			toastError(error);
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	const handleUpdateCard = async (data: Card, supplier: Omit<Supplier, 'id'> | null) => {
		if (!data) {
			toast.error('No data provided');
			return;
		}
		if (isNaN(data.amount) || data.amount <= 0) {
			toast.error('Amount must be greater than 0');
			return;
		}
		if (!data.name) {
			toast.error('Name and Supplier are required');
			return;
		}
		if (!user) {
			toast.error('unable to perform encryption');
			return;
		}

		if (!user.salt || !user.verifyToken) {
			toast.error('unable to perform encryption');
			return;
		}
		if (data.cvv || data.cardNumber) {
			if (!globalKey) {
				toast.error('Please provide encryption key');
				return;
			}
			if (
				!validateGlobalKey(
					user.verifyToken,
					globalKey,
					user.salt
				)
			) {
				toast.error('invalid encryption key');
				return;
			}
		}
		setLoading(true);
		let last4, cvv, cardNumber;
		if (data.cardNumber) {
			last4 = data.cardNumber.slice(-4);
		}
		if (data.cardNumber || data.cvv) {
			const encryptedData = encryptCard(
				{ cardNumber: data.cardNumber, cvv: data.cvv },
				globalKey!,
				user.salt
			);
			cardNumber = encryptedData.cardNumber;
			cvv = encryptedData.cvv;
		}
		try {
				await updateCardWithNewSupplierMutation.mutateAsync({
					id: params.id as string,
					data: {
						card: {
						name: data.name,
						description: data.description,
						isPhysical: data.isPhysical,
						amount: data.amount,
						currency: data.currency,
						supplier: data.supplier,
						cardNumber,
						last4,
						expiry: data.expiry,
						cvv
					},
					supplier: supplier ?? undefined
					}
				});
			setShowEncryptedData(false);
			setCvv('');
			setCardNumber('');
			setShowEditDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
			console.error('Error updating card:', error);
			toastError(error);
		}
		setLoading(false);
	};

	const clearStoreFilter = () => {
		setStoreFilter('');
	};

	if (loading || giftCardLoading || supplierLoading || isDeletingCard) {
		return <Loading />;
	}

	if (!card) {
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
	const currencySymbol = getCurrencySymbol(card.currency);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col gap-4 md:flex-row justify-between items-center mb-6">
				<Button
					className="w-full md:w-auto"
					variant="outline"
					onClick={handleBack}
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Cards
				</Button>
				<div className="flex gap-2 w-full md:w-auto">
					<Button
						variant="outline"
						className="flex-1"
						onClick={handleEdit}
					>
						<Edit className="mr-2 h-4 w-4" /> Edit
					</Button>
					<Button
						variant="destructive"
						className="flex-1"
						onClick={() => setShowConfirmationDialog(true)}
					>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					{/* Card preview - Matching the home page card layout */}
					<div className="mb-3">
						<GiftCardItem giftCard={card} supplier={supplier} />
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
										{card.amount}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{card.isPhysical ? (
									<CreditCard className="h-5 w-5 text-muted-foreground" />
								) : (
									<Smartphone className="h-5 w-5 text-muted-foreground" />
								)}
								<div>
									<div className="text-sm text-muted-foreground">
										Card Type
									</div>
									<div className="font-medium">
										{card.isPhysical
											? 'Physical Card'
											: 'Digital Card'}
									</div>
								</div>
							</div>
						</div>

						{card.description && (
							<div className="flex items-start gap-2 mt-4 bg-background p-3 rounded-lg border">
								<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<div className="text-sm text-muted-foreground">
										Description
									</div>
									<div className="mt-1">
										{card.description}
									</div>
								</div>
							</div>
						)}

						{card.expiry && (
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Expires
									</div>
									<div className="font-medium">
										{new Date(
											card.expiry
										).toLocaleDateString('en-GB', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
										})}
									</div>
								</div>
							</div>
						)}

						{card.cardNumber && (
							<div className="flex justify-between items-center gap-2">
								<div className="flex items-center gap-2">
									<button
										onClick={toggleEncryptedData}
										className="h-5 w-5 text-muted-foreground"
									>
										{showEncryptedData ? (
											<EyeOff />
										) : (
											<Eye />
										)}
									</button>
									<div>
										<div className="text-sm text-muted-foreground">
											Card Number
										</div>
										<div className="font-medium">
											{showEncryptedData
												? cardNumber
												: '••• ••• •••• ' +
												  card.last4}
										</div>
									</div>
								</div>
								{showEncryptedData && (
									<button
										onClick={() => {
											if (cardNumber) {
												navigator.clipboard.writeText(
													cardNumber
												);
												toast.success(
													'Card number copied to clipboard'
												);
											}
										}}
										className="h-5 w-5 text-muted-foreground"
									>
										<Copy />
									</button>
								)}
							</div>
						)}

						{card.cvv && (
							<div className="flex justify-between items-center gap-2">
								<div className="flex items-center gap-2">
									<button
										onClick={toggleEncryptedData}
										className="h-5 w-5 text-muted-foreground"
									>
										{showEncryptedData ? (
											<EyeOff />
										) : (
											<Eye />
										)}
									</button>
									<div>
										<div className="text-sm text-muted-foreground">
											CVV
										</div>
										<div className="font-medium">
											{showEncryptedData ? cvv : '•••'}
										</div>
									</div>
								</div>
								{showEncryptedData && (
									<button
										onClick={() => {
											if (cardNumber) {
												navigator.clipboard.writeText(
													cvv
												);
												toast.success(
													'Card number copied to clipboard'
												);
											}
										}}
										className="h-5 w-5 text-muted-foreground"
									>
										<Copy />
									</button>
								)}
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
								{(supplier?.stores ?? []).length}{' '}
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
											src={getCloudinaryUrl(store.image) || '/store.png'}
											alt={store.name}
											width={40}
											height={40}
											className="rounded-md"
										/>
										<div>
											<div className="font-medium">
												{store.name}
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

			{showEncryptionDialog && (
				<EncryptionDialog
					onClose={() => setShowEncryptionDialog(false)}
					onSave={decryptData}
				/>
			)}
			{showEditDialog && (
				<GiftCardDialog
					giftCard={card}
					onClose={() => setShowEditDialog(false)}
					onSubmit={handleUpdateCard}
				/>
			)}
			{showConfirmationDialog && (
				<ConfirmationDialog
					title="Delete Card"
					body="Are you sure you want to delete this card?"
					onClose={() => setShowConfirmationDialog(false)}
					onAccept={handleDelete}
					buttonText="Delete"
				/>
			)}
		</div>
	);
}
