import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import type { CreateGiftCardDetails, GiftCard } from '../types/gift-card';
import { currencies } from '../types/gift-card';
import { Supplier } from '../types/supplier';
import { X, Plus, CreditCard, Smartphone, Store, Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useSupplier } from '../hooks/useSupplier';
import Loading from './loading';
import { useEncryption } from '../context/EncryptionContext';
import { decryptCardFields, validateGlobalKey } from '../lib/cryptoHelpers';
import { useAuth } from '../hooks/useAuth';
import { GiftCardItem } from './GiftCardItem';
import { getDarkerColor } from '../lib/colors';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';

interface GiftCardDialogProps {
	giftCard?: GiftCard;
	supplier?: Supplier;
	onSubmit: (data: CreateGiftCardDetails) => Promise<void>;
	onClose: () => void;
}

export function GiftCardDialog({
	onClose,
	onSubmit,
	giftCard,
	supplier,
}: GiftCardDialogProps) {
	const { globalKey, setGlobalKey } = useEncryption();
	const { user } = useAuth();
	const [formData, setFormData] = useState<CreateGiftCardDetails>({
		name: '',
		amount: 0,
		currency: 'ILS', // Default to ILS
		description: '',
		supportedStores: [],
		isPhysical: true,
		supplierName: supplier ? supplier.name : '',
		stores_images: [],
		supplierId: 'other',
		supplier: '',
		encryptionKey: '',
		fromColor: '#6B7280',
		...giftCard,
		cardNumber: '',
		cvv: '',
	});

	const [disabledCardTypes, setDisabledCardTypes] = useState<boolean>(false);
	const [keyValidated, setKeyValidated] = useState(false);
	const [customSupplier, setCustomSupplier] = useState('');
	const [showCustomSupplier, setShowCustomSupplier] = useState(false);
	const [storeInput, setStoreInput] = useState('');
	const [storeSearch, setStoreSearch] = useState('');
	const [showStoreSelector, setShowStoreSelector] = useState(false);
	const [decodedToForm, setDecodedToForm] = useState(false);
	const { suppliers, loading, stores } = useSupplier();
	const newSuppliers = useMemo(() => {
		const otherSupplier: Supplier = {
			_id: 'other',
			name: 'Other',
			stores: [],
			fromColor: '#6B7280',
			cardTypes: ['physical', 'digital'],
			toColor: '#374151',
		};
		return [...suppliers, otherSupplier];
	}, [suppliers]);

	const filteredStores = stores.filter((store) =>
		store.name.toLowerCase().includes(storeSearch.toLowerCase())
	);

	const colorRef = useRef(formData.fromColor);

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
		const supplier = newSuppliers.find((s) => s._id === value);

		if (supplier) {
			if (supplier._id === 'other') {
				setShowCustomSupplier(true);
				setFormData((prev) => ({
					...prev,
					supplierId: 'other',
					supportedStores: [], // Clear supported stores for custom supplier
				}));
				setShowStoreSelector(true);
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
				setFormData((prev) => ({
					...prev,
					supplierId: supplier._id,
					supplier: supplier.name,
					supportedStores: supplier.stores.map((store) => store.name), // Set supported stores from supplier
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

	const handleCustomSupplierChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setCustomSupplier(e.target.value);
		setFormData((prev) => ({
			...prev,
			supplier: e.target.value,
		}));
	};

	const addStore = () => {
		if (
			storeInput.trim() &&
			!formData.supportedStores.includes(storeInput.trim())
		) {
			setFormData((prev) => ({
				...prev,
				supportedStores: [...prev.supportedStores, storeInput.trim()],
			}));
			setStoreInput('');
		}
	};

	const removeStore = (index: number) => {
		setFormData((prev) => ({
			...prev,
			supportedStores: prev.supportedStores.filter((_, i) => i !== index),
		}));
	};

	const handleStoreKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addStore();
		}
	};

	const togglePhysical = () => {
		setFormData((prev) => ({
			...prev,
			isPhysical: !prev.isPhysical,
		}));
	};

	const toggleStoreSelection = (store: string) => {
		if (formData.supportedStores.includes(store)) {
			setFormData((prev) => ({
				...prev,
				supportedStores: prev.supportedStores.filter(
					(s) => s !== store
				),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				supportedStores: [...prev.supportedStores, store],
			}));
		}
	};

	const updateColor = useCallback(
		(color: string) => {
			setFormData((prev) => ({
				...prev,
				fromColor: color,
			}));
		},
		[setFormData]
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
		await onSubmit(formData);
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
		if (giftCard) {
			handleSupplierChange((giftCard.supplier as Supplier)._id);
		}
	}, [giftCard]);

	useEffect(() => {
		if (supplier) {
			handleSupplierChange(supplier._id);
		}
	}, [supplier]);

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

	if (loading) {
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
								supplier
									? supplier._id
									: (giftCard?.supplier as Supplier)?._id ||
									  ''
							}
							onValueChange={handleSupplierChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a supplier" />
							</SelectTrigger>
							<SelectContent>
								{newSuppliers.map((supplier) => (
									<SelectItem
										key={supplier._id}
										value={supplier._id}
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
									value={customSupplier}
									onChange={handleCustomSupplierChange}
									required
								/>
								<Input
									type="color"
									value={formData.fromColor}
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
							{formData.supplierId &&
								formData.supplierId !== 'other' && (
									<span className="text-xs text-muted-foreground">
										Predefined by supplier
									</span>
								)}
						</div>

						{/* Show store selector only for "other" supplier */}
						{showStoreSelector ? (
							<div className="space-y-3 border rounded-md p-3">
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Input
											placeholder="Add custom store"
											value={storeInput}
											onChange={(e) =>
												setStoreInput(e.target.value)
											}
											onKeyDown={handleStoreKeyDown}
										/>
									</div>
									<Button
										type="button"
										size="sm"
										onClick={addStore}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>

								<div className="flex flex-col space-y-2">
									<Label className="text-sm">
										Or select from available stores:
									</Label>
									<div className="relative">
										<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search stores..."
											value={storeSearch}
											onChange={(e) =>
												setStoreSearch(e.target.value)
											}
											className="pl-8"
										/>
									</div>
									<ScrollArea className="h-[150px] rounded-md border p-2">
										<div className="space-y-1">
											{filteredStores.map((store) => (
												<div
													key={store.name}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`store-${store.name}`}
														checked={formData.supportedStores.includes(
															store.name
														)}
														onCheckedChange={() =>
															toggleStoreSelection(
																store.name
															)
														}
													/>
													<label
														htmlFor={`store-${store.name}`}
														className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														{store.name}
													</label>
												</div>
											))}
											{filteredStores.length === 0 && (
												<p className="text-sm text-muted-foreground py-2 text-center">
													No stores found
												</p>
											)}
										</div>
									</ScrollArea>
								</div>
							</div>
						) : null}

						{/* Display selected stores */}
						<div className="flex flex-wrap gap-2 mt-2">
							{formData.supportedStores.map((store, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="flex items-center gap-1"
								>
									{store}
									{formData.supplierId === 'other' && (
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removeStore(index)}
										/>
									)}
								</Badge>
							))}
							{formData.supportedStores.length === 0 && (
								<span className="text-sm text-muted-foreground">
									No stores added yet
								</span>
							)}
						</div>
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
																	formData.encryptionKey
																}
																onChange={
																	handleChange
																}
															/>
														</div>
														<Button
															type="button"
															className="w-full bg-teal-600 hover:bg-teal-700 my-2"
															onClick={() =>
																decodeDataToForm(
																	formData.encryptionKey
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
																	formData.encryptionKey
																}
																onChange={
																	handleChange
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
														formData.encryptionKey
													}
													onChange={handleChange}
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
								giftCard={{
									...formData,
									supplier:
										suppliers.find(
											(s) => s._id === formData.supplierId
										) ||
										({
											_id: 'other',
											name: formData.supplier as string,
											stores: formData.supportedStores.map(
												(storeName) => {
													const fullStore =
														stores.find(
															(s) =>
																s.name
																	.trim()
																	.toLowerCase() ===
																storeName
																	.trim()
																	.toLowerCase()
														);
													return (
														fullStore || {
															name: storeName,
														}
													);
												}
											),
											fromColor: formData.fromColor,
											toColor: getDarkerColor(
												formData.fromColor
											),
											cardTypes: ['physical', 'digital'],
										} satisfies Supplier),
									_id: '',
									user: user?._id || '',
								}}
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
