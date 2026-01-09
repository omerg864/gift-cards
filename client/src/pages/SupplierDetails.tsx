'use client';

import { Supplier, SupplierStore } from '@shared/types/supplier.types';
import { debounce } from 'lodash';
import {
    ArrowLeft,
    CreditCard,
    Edit,
    Plus,
    Search,
    Smartphone,
    Store,
    Trash,
    X,
} from 'lucide-react';
import {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card } from '../../../shared/types/card.types';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { GiftCardDialog } from '../components/GiftCardDialog';
import Loading from '../components/loading';
import { SupplierCard } from '../components/SupplierCard';
import SupplierDialog from '../components/SupplierDialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useEncryption } from '../context/EncryptionContext';
import { useCreateCardAndSupplier } from '../hooks/useCardQuery';
import { useDeleteSupplier, useGetSupplier, useUpdateSupplier } from '../hooks/useSupplierQuery';
import { encryptCard, validateGlobalKey } from '../lib/cryptoHelpers';
import { getCloudinaryUrl, toastError } from '../lib/utils';
import { useAuthStore } from '../stores/useAuthStore';
import {
    CreateSupplierDetails,
} from '../types/supplier';

export default function SupplierDetailsPage() {
	const navigate = useNavigate();
		const params = useParams();
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
	const { data: supplier, isLoading: loading } = useGetSupplier(params?.id ?? '');
	const [filteredStores, setFilteredStores] = useState<SupplierStore[]>([]);
	const [storeFilter, setStoreFilter] = useState('');
	const { user } = useAuthStore();
	const { globalKey } = useEncryption();
	const storeFilterRef = useRef<string>('');
	const storeFilterInputRef = useRef<HTMLInputElement | null>(null);

	const { mutateAsync: updateSupplier, isPending: isUpdating } = useUpdateSupplier();
	const { mutateAsync: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
	const createCardAndSupplierMutation = useCreateCardAndSupplier();

	useEffect(() => {
		if (supplier) {
			if (storeFilter.trim() === '') {
				setFilteredStores(supplier.stores ?? []);
			} else {
				const filtered = (supplier.stores ?? []).filter((store) =>
					store.name.toLowerCase().includes(storeFilter.toLowerCase())
				);
				setFilteredStores(filtered);
			}
		}
	}, [storeFilter, supplier]);

	const updateStoreFilter = useCallback(
		(text: string) => {
			setStoreFilter(text);
		},
		[setStoreFilter]
	);

	const debouncedUpdateStoreFilter = useMemo(
		() => debounce(updateStoreFilter, 300),
		[updateStoreFilter]
	);

	const handleStoreFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		storeFilterRef.current = value;
		debouncedUpdateStoreFilter(value);
	};

	const handleBack = () => {
		navigate(-1);
	};

	const handleAddCard = () => {
		setShowAddDialog(true);
	};

	const handleNewCardSubmit = async (card: Card, supplier: Omit<Supplier, 'id'> | null) => {
		if (!card) {
			toast.error('No data provided');
			return;
		}
		if (isNaN(card.amount) || card.amount <= 0) {
			toast.error('Amount must be greater than 0');
			return;
		}
		if (!card.name) {
			toast.error('Name is required');
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
		if (card.cvv || card.cardNumber) {
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
		let last4, cvv, cardNumber;
		if (card.cardNumber) {
			last4 = card.cardNumber.slice(-4);
		}
		if (card.cardNumber || card.cvv) {
			const encryptedData = encryptCard(
				{ cardNumber: card.cardNumber, cvv: card.cvv },
				globalKey!,
				user.salt
			);
			cardNumber = encryptedData.cardNumber;
			cvv = encryptedData.cvv;
		}
		try {
				await createCardAndSupplierMutation.mutateAsync({
					card: {
						name: card.name,
						description: card.description || '',
						isPhysical: card.isPhysical,
						amount: card.amount,
						currency: card.currency,
					supplier: card.supplier,
					cardNumber,
					last4,
					expiry: card.expiry,
					cvv
					},
					supplier: supplier ?? undefined
				});
			setShowAddDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
			console.error('Error adding card:', error);
			toastError(error);
		}
	};

	const handleEdit = async (data: CreateSupplierDetails) => {
		if (!data) {
			toast.error('No data provided');
			return false;
		}
		if (!data.name || !data.fromColor || !data.toColor) {
			toast.error('Please provide all required fields');
			return false;
		}
		if (!data.cardTypes || data.cardTypes.length === 0) {
			toast.error('At least one Card type is required');
			return false;
		}
		try {
			if (supplier) {
				await updateSupplier({ id: supplier.id, data });
				toast.success('Supplier updated successfully');
			}
		} catch (error) {
			toastError(error);
			return false;
		}
		return true;
	};

	const handleDelete = async () => {
		if (!supplier) {
			toast.error('Supplier not found');
			return;
		}
		try {
			await deleteSupplier(supplier.id);
			toast.success('Supplier deleted successfully');
			navigate('/supplier/list');
			setShowConfirmationDialog(false);
		} catch (error) {
			toastError(error);
		}
	};

	const clearStoreFilter = () => {
		setStoreFilter('');
		storeFilterRef.current = '';
		if (storeFilterInputRef.current) {
			storeFilterInputRef.current.value = '';
		}
	};

	if (loading || !supplier || isUpdating || isDeleting) {
		return <Loading />;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col gap-4 md:flex-row justify-between items-center mb-6">
				<Button
					variant="outline"
					className="w-full md:w-auto"
					onClick={handleBack}
				>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to Suppliers
				</Button>
				{supplier.user && (
					<div className="flex gap-2 w-full md:w-auto">
						<Button
							className="flex-1"
							variant="outline"
							onClick={() => setShowEditDialog(true)}
						>
							<Edit className="mr-2 h-4 w-4" /> Edit
						</Button>
						<Button
							className="flex-1"
							variant="destructive"
							onClick={() => setShowConfirmationDialog(true)}
						>
							<Trash className="mr-2 h-4 w-4" /> Delete
						</Button>
					</div>
				)}
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					{/* Supplier Card */}
					<SupplierCard supplier={supplier} />

					{/* Supplier Information */}
					<div className="bg-muted/30 p-6 rounded-lg mt-2">
						<h2 className="text-xl font-semibold mb-4">
							About {supplier.name}
						</h2>
						<p className="text-muted-foreground mb-4">
							{supplier.description}
						</p>

						<div className="flex flex-wrap gap-2 mt-4">
							{supplier.cardTypes.includes('physical') && (
								<Badge
									variant="outline"
									className="flex items-center gap-1"
								>
									<CreditCard className="h-3 w-3" /> Physical
									Cards Available
								</Badge>
							)}
							{supplier.cardTypes.includes('digital') && (
								<Badge
									variant="outline"
									className="flex items-center gap-1"
								>
									<Smartphone className="h-3 w-3" /> Digital
									Cards Available
								</Badge>
							)}
						</div>
					</div>
				</div>

				<div>
					{/* Supported Stores */}
					<div className="bg-muted/30 p-6 rounded-lg">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold flex items-center">
								<Store className="mr-2 h-5 w-5" /> Supported
								Stores
							</h2>
							<div className="text-sm text-muted-foreground">
								{filteredStores.length} of{' '}
								{(supplier.stores ?? []).length} stores
							</div>
						</div>

						{/* Search input for stores */}
						<div className="relative mb-4">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search stores..."
								onChange={handleStoreFilterChange}
								ref={storeFilterInputRef}
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

					<div className="mt-6">
						<Button
							onClick={handleAddCard}
							className="w-full bg-teal-600 hover:bg-teal-700 text-wrap"
						>
							<Plus className="mr-2 h-4 w-4" /> Add{' '}
							{supplier.name} Gift Card to My Collection
						</Button>
					</div>
				</div>
			</div>

			{showAddDialog && (
				<GiftCardDialog
					onSubmit={handleNewCardSubmit}
					onClose={() => setShowAddDialog(false)}
				/>
			)}
			{showEditDialog && (
				<SupplierDialog
					confirmButtontext="Update Supplier"
					onSubmit={handleEdit}
					onClose={() => setShowEditDialog(false)}
					supplier={supplier}
				/>
			)}
			{showConfirmationDialog && (
				<ConfirmationDialog
					title="Delete supplier"
					body={
						<>
							<p>
								Are you sure you want to delete this supplier?
							</p>
							<p>This action cannot be undone.</p>
							<p>
								All gift cards associated with this supplier
								will be deleted.
							</p>
						</>
					}
					onClose={() => setShowConfirmationDialog(false)}
					onAccept={handleDelete}
				/>
			)}
		</div>
	);
}
