'use client';

import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	ChangeEvent,
	useRef,
} from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
	ArrowLeft,
	Store,
	CreditCard,
	Smartphone,
	Plus,
	Search,
	X,
	Edit,
	Trash,
} from 'lucide-react';
import {
	Supplier,
	Store as IStore,
	CreateSupplierDetails,
} from '../types/supplier';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateGiftCardDetails } from '../types/gift-card';
import { useSupplier } from '../hooks/useSupplier';
import Loading from '../components/loading';
import { toast } from 'react-toastify';
import { SupplierCard } from '../components/SupplierCard';
import { Input } from '../components/ui/input';
import { createCard, createCardAndSupplier } from '../services/cardService';
import { getDarkerColor } from '../lib/colors';
import { encryptCard, validateGlobalKey } from '../lib/cryptoHelpers';
import { useAuth } from '../hooks/useAuth';
import { useEncryption } from '../context/EncryptionContext';
import { toastError } from '../lib/utils';
import { useGiftCards } from '../hooks/useGiftCards';
import {
	deleteUserSupplier,
	updateUserSupplier,
} from '../services/supplierService';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SupplierDialog from '../components/SupplierDialog';
import { debounce } from 'lodash';

export default function SupplierDetailsPage() {
	const navigate = useNavigate();
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { suppliers, loading, refetchSuppliers } = useSupplier();
	const { refetchCards } = useGiftCards();
	const [supplier, setSupplier] = useState<Supplier | null>(null);
	const [filteredStores, setFilteredStores] = useState<IStore[]>([]);
	const [storeFilter, setStoreFilter] = useState('');
	const params = useParams();
	const { user } = useAuth();
	const { setGlobalKey } = useEncryption();
	const storeFilterRef = useRef<string>('');
	const storeFilterInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		// Simulate loading
		const getSupplier = async () => {
			const supplier = suppliers.find((s) => s._id === params.id);
			if (supplier) {
				setSupplier(supplier);
				setFilteredStores(supplier.stores);
			} else {
				toast.error('Supplier not found');
			}
		};

		if (suppliers.length > 0) {
			getSupplier();
		}
	}, [suppliers]);

	useEffect(() => {
		if (supplier) {
			if (storeFilter.trim() === '') {
				setFilteredStores(supplier.stores);
			} else {
				const filtered = supplier.stores.filter((store) =>
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

	const handleNewCardSubmit = async (data: CreateGiftCardDetails) => {
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
		if (!user) {
			toast.error('unable to perform encryption');
			return;
		}

		if (!user.salt || !user.verifyToken) {
			toast.error('unable to perform encryption');
			return;
		}
		if (data.cvv || data.cardNumber) {
			if (!data.encryptionKey) {
				toast.error('Please provide encryption key');
				return;
			}
			if (
				!validateGlobalKey(
					user.verifyToken,
					data.encryptionKey,
					user.salt
				)
			) {
				toast.error('invalid encryption key');
				return;
			}
			setGlobalKey(data.encryptionKey);
		}
		let last4, cvv, cardNumber;
		if (data.cardNumber) {
			last4 = data.cardNumber.slice(-4);
		}
		if (data.cardNumber || data.cvv) {
			const encryptedData = encryptCard(
				{ cardNumber: data.cardNumber, cvv: data.cvv },
				data.encryptionKey,
				user.salt
			);
			cardNumber = encryptedData.cardNumber;
			cvv = encryptedData.cvv;
		}
		try {
			if (data.supplierId === 'other') {
				if (!data.supplier) {
					toast.error('Supplier name is required');
					return;
				}
				if (!data.fromColor) {
					toast.error('color is required');
					return;
				}
				await createCardAndSupplier(
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
					[],
					data.fromColor,
					getDarkerColor(data.fromColor),
					cardNumber,
					last4,
					data.expiry,
					cvv
				);
				refetchSuppliers();
			} else {
				await createCard(
					data.name,
					data.supplierId,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency,
					cardNumber,
					last4,
					data.expiry,
					cvv
				);
			}
			refetchCards();
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
		setIsLoading(true);
		try {
			await updateUserSupplier(data);
			await refetchSuppliers();
			toast.success('Supplier created successfully');
		} catch (error) {
			toastError(error);
			setIsLoading(false);
			return false;
		}
		setIsLoading(false);
		return true;
	};

	const handleDelete = async () => {
		if (!supplier) {
			toast.error('Supplier not found');
			return;
		}
		setIsLoading(true);
		try {
			await deleteUserSupplier(supplier._id);
			toast.success('Supplier deleted successfully');
			navigate('/supplier/list');
			setShowConfirmationDialog(false);
			refetchSuppliers();
			refetchCards();
		} catch (error) {
			toastError(error);
		}
		setIsLoading(false);
	};

	const clearStoreFilter = () => {
		setStoreFilter('');
		storeFilterRef.current = '';
		if (storeFilterInputRef.current) {
			storeFilterInputRef.current.value = '';
		}
	};

	if (loading || !supplier || isLoading) {
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
								{supplier.stores.length} stores
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
					supplier={supplier}
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
