'use client';

import type React from 'react';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../components/ui/select';
import type { GiftCard } from '../types/gift-card';
import { currencies } from '../types/gift-card';
import {
	predefinedSuppliers,
	getSupplierByName,
	allAvailableStores,
} from '../types/supplier';
import { X, Plus, CreditCard, Smartphone, Store, Search } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface EditGiftCardDialogProps {
	giftCard: GiftCard;
	onUpdate: (updatedCard: GiftCard) => void;
	onClose: () => void;
}

export function EditGiftCardDialog({
	giftCard,
	onUpdate,
	onClose,
}: EditGiftCardDialogProps) {
	const [formData, setFormData] = useState<GiftCard>({
		...giftCard,
		supportedStores: giftCard.supportedStores || [],
		currency: giftCard.currency || 'ILS', // Ensure currency has a default
	});
	const [customSupplier, setCustomSupplier] = useState('');
	const [showCustomSupplier, setShowCustomSupplier] = useState(false);
	const [storeInput, setStoreInput] = useState('');
	const [storeSearch, setStoreSearch] = useState('');
	const [showStoreSelector, setShowStoreSelector] = useState(false);

	// Filter available stores based on search
	const filteredStores = allAvailableStores.filter((store) =>
		store.toLowerCase().includes(storeSearch.toLowerCase())
	);

	// Initialize supplier data
	useEffect(() => {
		const supplier = getSupplierByName(giftCard.supplier);

		if (supplier.id === 'other') {
			setShowCustomSupplier(true);
			setCustomSupplier(giftCard.supplier);
			setFormData((prev) => ({
				...prev,
				supplierId: 'other',
			}));
			setShowStoreSelector(true);
		} else {
			setFormData((prev) => ({
				...prev,
				supplierId: supplier.id,
			}));
			setShowStoreSelector(false);
		}
	}, [giftCard]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === 'amount' ? Number.parseFloat(value) : value,
		}));
	};

	const handleSupplierChange = (value: string) => {
		const supplier = predefinedSuppliers.find((s) => s.id === value);

		if (supplier) {
			if (supplier.id === 'other') {
				setShowCustomSupplier(true);
				setShowStoreSelector(true);
				setFormData((prev) => ({
					...prev,
					supplierId: 'other',
					// Keep existing stores if already "other", otherwise clear them
					supportedStores:
						prev.supplierId === 'other' ? prev.supportedStores : [],
				}));
			} else {
				setShowCustomSupplier(false);
				setShowStoreSelector(false);
				setFormData((prev) => ({
					...prev,
					supplierId: supplier.id,
					supplier: supplier.name,
					supportedStores: supplier.supportedStores, // Set supported stores from supplier
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onUpdate(formData);
		onClose();
	};

	// Split the card number into parts for the 4 input fields
	const getCardNumberParts = () => {
		const parts = formData.cardNumber?.split(' ') || [];
		while (parts.length < 4) parts.push('');
		return parts;
	};

	const cardNumberParts = getCardNumberParts();

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Gift Card</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="supplier">Supplier</Label>
						<Select
							value={formData.supplierId}
							onValueChange={handleSupplierChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a supplier" />
							</SelectTrigger>
							<SelectContent>
								{predefinedSuppliers.map((supplier) => (
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
							<div className="mt-2">
								<Input
									placeholder="Enter custom supplier name"
									value={customSupplier}
									onChange={handleCustomSupplierChange}
									required
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
							value={formData.description || ''}
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
													key={store}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`store-${store}`}
														checked={formData.supportedStores.includes(
															store
														)}
														onCheckedChange={() =>
															toggleStoreSelection(
																store
															)
														}
													/>
													<label
														htmlFor={`store-${store}`}
														className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														{store}
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
							<div className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label htmlFor="cardNumber">
										Card Number (Optional)
									</Label>
									<div className="grid grid-cols-4 gap-2">
										<Input
											type="text"
											maxLength={4}
											placeholder="0000"
											className="text-center"
											value={cardNumberParts[0]}
											onChange={(e) => {
												const value = e.target.value;
												if (
													value.length === 4 &&
													e.target.nextElementSibling
												) {
													(
														e.target
															.nextElementSibling as HTMLInputElement
													).focus();
												}
												const parts = [
													...cardNumberParts,
												];
												parts[0] = value;
												setFormData({
													...formData,
													cardNumber: parts
														.join(' ')
														.trim(),
												});
											}}
										/>
										<Input
											type="text"
											maxLength={4}
											placeholder="0000"
											className="text-center"
											value={cardNumberParts[1]}
											onChange={(e) => {
												const value = e.target.value;
												if (
													value.length === 4 &&
													e.target.nextElementSibling
												) {
													(
														e.target
															.nextElementSibling as HTMLInputElement
													).focus();
												}
												const parts = [
													...cardNumberParts,
												];
												parts[1] = value;
												setFormData({
													...formData,
													cardNumber: parts
														.join(' ')
														.trim(),
												});
											}}
										/>
										<Input
											type="text"
											maxLength={4}
											placeholder="0000"
											className="text-center"
											value={cardNumberParts[2]}
											onChange={(e) => {
												const value = e.target.value;
												if (
													value.length === 4 &&
													e.target.nextElementSibling
												) {
													(
														e.target
															.nextElementSibling as HTMLInputElement
													).focus();
												}
												const parts = [
													...cardNumberParts,
												];
												parts[2] = value;
												setFormData({
													...formData,
													cardNumber: parts
														.join(' ')
														.trim(),
												});
											}}
										/>
										<Input
											type="text"
											maxLength={4}
											placeholder="0000"
											className="text-center"
											value={cardNumberParts[3]}
											onChange={(e) => {
												const value = e.target.value;
												const parts = [
													...cardNumberParts,
												];
												parts[3] = value;
												setFormData({
													...formData,
													cardNumber: parts
														.join(' ')
														.trim(),
												});
											}}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="expirationDate">
											Expiration Date (Optional)
										</Label>
										<Input
											id="expirationDate"
											name="expirationDate"
											value={formData.expirationDate}
											onChange={handleChange}
											placeholder="MM/YYYY"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cvv">
											CVV (Optional)
										</Label>
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
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
