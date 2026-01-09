import { Card } from '@shared/types/card.types';
import { Supplier } from '@shared/types/supplier.types';
import { debounce } from 'lodash';
import { CreditCard, Smartphone, Store } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useEncryption } from '../context/EncryptionContext';
import { useGetSuppliers } from '../hooks/useSupplierQuery';
import { getDarkerColor } from '../lib/colors';
import { decryptCardFields, validateGlobalKey } from '../lib/cryptoHelpers';
import { useAuthStore } from '../stores/useAuthStore';
import type { GiftCard } from '../types/gift-card';
import { currencies } from '../types/gift-card';
import { GiftCardItem } from './GiftCardItem';
import { StoreListPicker } from './StoreListPicker';
import Loading from './loading';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

interface GiftCardDialogProps {
	giftCard?: GiftCard;
	onSubmit: (data: Card, supplier: Omit<Supplier, 'id'> | null) => Promise<void>;
	onClose: () => void;
}

const defaultOtherSupplier: Supplier = {
	id: 'other',
	name: 'Other',
	stores: [],
	fromColor: '#6B7280',
	cardTypes: ['physical', 'digital'],
	toColor: '#374151',
};

export function GiftCardDialog({
	onClose,
	onSubmit,
	giftCard,
}: GiftCardDialogProps) {
	const { globalKey, setGlobalKey } = useEncryption();
	const { user } = useAuthStore();
	const [formData, setFormData] = useState<Card>({
		id: '',
		user: user?.id || '',
		name: '',
		amount: 0,
		currency: 'ILS', // Default to ILS
		description: '',
		isPhysical: true,
		supplier: '',
		notified1Month: false,
		notified2Month: false,
		...giftCard,
		cardNumber: '',
		cvv: '',
	});

	const [disabledCardTypes, setDisabledCardTypes] = useState<boolean>(false);
	const [keyValidated, setKeyValidated] = useState(false);
	const [showCustomSupplier, setShowCustomSupplier] = useState(false);
	const [showStoreSelector, setShowStoreSelector] = useState(false);
	const [decodedToForm, setDecodedToForm] = useState(false);
	const { data: suppliers, isLoading: loadingSuppliers } = useGetSuppliers();
	const { selectedSupplier, supplierOptions} = useMemo(() => {
		const supplierOptions = [...(suppliers ?? []), defaultOtherSupplier];
		const selectedSupplier = supplierOptions.find((s) => s.id === formData.supplier);
		return {selectedSupplier, supplierOptions};
	}, [suppliers, formData.supplier]);
	const [newCustomSupplier, setNewCustomSupplier] = useState<Omit<Supplier, 'id'> | null>(null);

	const allStores = useMemo(() => {
		if (newCustomSupplier) {
			return (newCustomSupplier.stores ?? []).map((store) => store.name);
		}
		return (selectedSupplier?.stores ?? []).map((store) => store.name);
	}, [selectedSupplier, newCustomSupplier]);

	const colorRef = useRef(selectedSupplier?.fromColor);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === 'amount'
					? Number.parseFloat(value) || 0
					: name === 'expiry'
					? value
						? new Date(value)
						: undefined
					: value,
		}));
	};

	const handleSupplierChange = (value: string) => {
		const supplier = supplierOptions.find((s) => s.id === value);

		if (supplier) {
			if (supplier.id === 'other') {
				setShowCustomSupplier(true);
				setShowStoreSelector(true);
				setNewCustomSupplier(defaultOtherSupplier);
			} else {
				const onlyPhysicalType =
					supplier.cardTypes.includes('physical') &&
					supplier.cardTypes.length === 1;
				const onlyDigitalType =
					supplier.cardTypes.includes('digital') &&
					supplier.cardTypes.length === 1;
				setDisabledCardTypes(onlyPhysicalType || onlyDigitalType);
				setShowCustomSupplier(false);
				setShowStoreSelector(false);
				setNewCustomSupplier(null);
				setFormData((prev) => ({
					...prev,
					supplier: supplier.id,
					isPhysical: onlyPhysicalType
						? true
						: onlyDigitalType
						? false
						: prev.isPhysical,
				}));
			}
		}
	};

	const handleCurrencyChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			currency: value,
		}));
	};

	const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGlobalKey(e.target.value);
	};

	const handleCustomSupplierNameChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setNewCustomSupplier((prev) => ({
			...(prev as Omit<Supplier, 'id'>),
			name: e.target.value,
		}));
	};

	const addStore = (storeName: string) => {
		if (
			storeName.trim() &&
			!allStores.includes(storeName.trim())
		) {
			setNewCustomSupplier((prev) => ({
				...(prev as Omit<Supplier, 'id'>),
				stores: [...(prev?.stores ?? []), { name: storeName.trim() }],
			}));
		}
	};

	const removeStore = (index: number) => {
		setNewCustomSupplier((prev) => ({
			...(prev as Omit<Supplier, 'id'>),
			stores: (prev?.stores ?? []).filter((_, i) => i !== index),
		}));
	};

	const togglePhysical = () => {
		setFormData((prev) => ({
			...prev,
			isPhysical: !prev.isPhysical,
		}));
	};

	const toggleStoreSelection = (store: string) => {
		if (newCustomSupplier?.stores?.find((s) => s.name === store)) {
			setNewCustomSupplier((prev) => ({
				...(prev as Omit<Supplier, 'id'>),
				stores: (prev?.stores ?? []).filter(
					(s) => s.name !== store
				),
			}));
		} else {
			setNewCustomSupplier((prev) => ({
				...(prev as Omit<Supplier, 'id'>),
				stores: [...prev?.stores ?? [], { name: store }],
			}));
		}
	};

	const updateColor = useCallback(
		(color: string) => {
			setNewCustomSupplier((prev) => ({
				...(prev as Omit<Supplier, 'id'>),
				fromColor: color,
				toColor: getDarkerColor(color)
			}));
		},
		[setNewCustomSupplier]
	);

	const debouncedUpdateColor = useMemo(
		() => debounce(updateColor, 300),
		[updateColor]
	);

	const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		colorRef.current = value;
		debouncedUpdateColor(value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData, newCustomSupplier);
	};

	const decodeDataToForm = (key: string | null) => {
		if (!giftCard) {
			toast.error('No gift card data to decode');
			return;
		}
		if (!key) {
			toast.error('No encryption key provided');
			return;
		}
		if (!user) {
			toast.error('User not found');
			return;
		}
		if (!user.salt || !user.verifyToken) {
			toast.error('Unable to perform decryption');
			return;
		}
		if (!validateGlobalKey(user.verifyToken, key, user.salt)) {
			toast.error('Invalid encryption key');
			return;
		}
		const decryptedData = decryptCardFields(giftCard, key, user.salt);
		setFormData((prev) => ({
			...prev,
			cardNumber: decryptedData.cardNumber,
			cvv: decryptedData.cvv,
			encryptionKey: key,
		}));
		setGlobalKey(key);
		setDecodedToForm(true);
	};

	useEffect(() => {
		if (
			globalKey &&
			user &&
			validateGlobalKey(
				user?.verifyToken || '',
				globalKey,
				user?.salt || ''
			)
		) {
			setFormData((prev) => ({
				...prev,
				encryptionKey: globalKey,
			}));
			setKeyValidated(true);
		}
	}, [globalKey, user]);

	if (loadingSuppliers) {
		return <Loading />;
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Gift Card</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name" className="font-semibold">
							Card Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							value={formData.name || ''}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="supplier">
							Supplier <span className="text-red-500">*</span>
						</Label>
						<Select
							defaultValue={
								selectedSupplier
									? selectedSupplier.id
									: giftCard?.supplier || ''
							}
							onValueChange={handleSupplierChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a supplier" />
							</SelectTrigger>
							<SelectContent>
								{supplierOptions.map((supplier) => (
									<SelectItem
										key={supplier.id}
										value={supplier.id}
									>
										{supplier.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{showCustomSupplier && (
							<div className="mt-2 space-y-2">
								<Input
									placeholder="Enter custom supplier name"
									value={newCustomSupplier?.name || ''}
									onChange={handleCustomSupplierNameChange}
									required
								/>
								<Input
									type="color"
									value={newCustomSupplier?.fromColor || '#6B7280'}
									onChange={handleColorChange}
								/>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="amount" className="font-semibold">
								Amount <span className="text-red-500">*</span>
							</Label>
							<Input
								id="amount"
								name="amount"
								type="number"
								value={formData.amount || ''}
								onChange={handleChange}
								required
								placeholder="0.00"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="currency" className="font-semibold">
								Currency <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.currency}
								onValueChange={handleCurrencyChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select currency" />
								</SelectTrigger>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem
											key={currency.code}
											value={currency.code}
										>
											{currency.code} ({currency.symbol})
											- {currency.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Add a description for this gift card"
							className="min-h-[80px]"
						/>
					</div>

					<div className="flex items-center justify-between space-y-0">
						<div className="flex items-center space-x-2">
							{formData.isPhysical ? (
								<CreditCard className="h-4 w-4" />
							) : (
								<Smartphone className="h-4 w-4" />
							)}
							<Label htmlFor="isPhysical">
								{formData.isPhysical
									? 'Physical Card'
									: 'Digital Card'}
							</Label>
						</div>
						<Switch
							id="isPhysical"
							disabled={disabledCardTypes}
							checked={formData.isPhysical}
							onCheckedChange={togglePhysical}
						/>
					</div>

					{/* Supported Stores Section */}
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label className="flex items-center">
								<Store className="h-4 w-4 mr-2" /> Supported
								Stores
							</Label>
							{formData.supplier && (
									<span className="text-xs text-muted-foreground">
										Predefined by supplier
									</span>
								)}
						</div>

						{/* Show store selector only for "other" supplier */}
						{showStoreSelector ? (
							<StoreListPicker
								selectedStores={newCustomSupplier?.stores ?? []}
								onAddStore={addStore}
								onRemoveStore={removeStore}
								onToggleStore={toggleStoreSelection}
							/>
						) : null}

						{/* Display selected stores */}
						{!showStoreSelector && (
							<div className="flex flex-wrap gap-2 mt-2">
								{allStores.map((store, index) => (
									<Badge
										key={index}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{store}
									</Badge>
								))}
								{allStores.length === 0 && (
									<span className="text-sm text-muted-foreground">
										No stores added yet
									</span>
								)}
							</div>
						)}
					</div>

					<div className="border-t pt-4">
						<details>
							<summary className="cursor-pointer text-sm font-medium mb-2">
								Optional Card Details
							</summary>
							{giftCard ? (
								(giftCard.cardNumber !== '' ||
									giftCard.cvv !== '') &&
								formData.cvv === '' &&
								formData.cardNumber === '' ? (
									<>
										{!decodedToForm && (
											<>
												{keyValidated ? (
													<Button
														type="button"
														className="w-full bg-teal-600 hover:bg-teal-700 my-2"
														onClick={() =>
															decodeDataToForm(
																globalKey
															)
														}
													>
														Decode Data
													</Button>
												) : (
													<>
														<div className="space-y-2">
															<span className="text-sm text-muted-foreground block">
																To securely
																store your card
																details, please
																enter your
																encryption key.
															</span>
															<Label htmlFor="encryptionKey">
																Encryption Key
															</Label>
															<Input
																id="encryptionKey"
																name="encryptionKey"
																type="password"
																value={
																	globalKey || ''
																}
																onChange={
																	handleKeyChange
																}
															/>
														</div>
														<Button
															type="button"
															className="w-full bg-teal-600 hover:bg-teal-700 my-2"
															onClick={() =>
																decodeDataToForm(
																	globalKey || ''
																)
															}
														>
															Decode Data
														</Button>
													</>
												)}
											</>
										)}
									</>
								) : (
									<>
										{(formData.cvv !== '' ||
											formData.cardNumber !== '') && (
											<>
												{keyValidated ? (
													<>
														<span className="text-sm text-muted-foreground block">
															Your saved
															encryption key will
															be used to securely
															encrypt the card
															details.
														</span>
													</>
												) : (
													<>
														<div className="space-y-2">
															<span className="text-sm text-muted-foreground block">
																To securely
																store your card
																details, please
																enter your
																encryption key.
															</span>
															<Label htmlFor="encryptionKey">
																Encryption Key{' '}
																<span className="text-red-500">
																	*
																</span>
															</Label>
															<Input
																id="encryptionKey"
																name="encryptionKey"
																type="password"
																value={
																	globalKey || ''
																}
																onChange={
																	handleKeyChange
																}
																required
															/>
														</div>
													</>
												)}
											</>
										)}
									</>
								)
							) : (
								<>
									{!keyValidated ? (
										(formData.cardNumber !== '' ||
											formData.cvv !== '') && (
											<div className="space-y-2">
												<span className="text-sm text-muted-foreground block">
													To securely store your card
													details, please enter your
													encryption key.
												</span>
												<Label htmlFor="encryptionKey">
													Encryption Key{' '}
													<span className="text-red-500">
														*
													</span>
												</Label>
												<Input
													id="encryptionKey"
													name="encryptionKey"
													type="password"
													value={
														globalKey || ''
													}
													onChange={handleKeyChange}
													required
												/>
											</div>
										)
									) : (
										<span className="text-sm text-muted-foreground block">
											Your saved encryption key will be
											used to securely encrypt the card
											details.
										</span>
									)}
								</>
							)}
							<div className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label htmlFor="cardNumber">
										Card Number
									</Label>
									<Input
										id="cardNumber"
										name="cardNumber"
										value={formData.cardNumber}
										onChange={handleChange}
										className="w-full"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="expiry">
											Expiration Date
										</Label>
										<Input
											id="expiry"
											name="expiry"
											type="date"
											value={
												formData.expiry
													? new Date(formData.expiry)
															.toISOString()
															.split('T')[0]
													: ''
											}
											onChange={handleChange}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cvv">CVV</Label>
										<Input
											id="cvv"
											name="cvv"
											value={formData.cvv}
											onChange={handleChange}
											maxLength={3}
											placeholder="123"
										/>
									</div>
								</div>
							</div>
						</details>
					</div>
					<div className="border-t pt-4">
						<details>
							<summary className="cursor-pointer text-sm font-medium mb-2">
								Preview
							</summary>
							<GiftCardItem
								giftCard={formData}
								supplier={newCustomSupplier ?? selectedSupplier}
							/>
						</details>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="w-full bg-teal-600 hover:bg-teal-700"
						>
							{giftCard ? 'Update Gift Card' : 'Add Gift Card'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
