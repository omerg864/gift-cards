import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import Loading from './loading';
import { useSupplier } from '../hooks/useSupplier';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { CreateSupplierDetails, Supplier } from '../types/supplier';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { getDarkerColor } from '../lib/colors';
import SupplierImageInput from './SupplierImageInput';
import { CreditCard, Plus, Search, Smartphone, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { SupplierCard } from './SupplierCard';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface SupplierDialogProps {
	supplier?: Supplier;
	onClose: () => void;
	onSubmit: (data: CreateSupplierDetails) => Promise<boolean>;
}
const SupplierDialog = ({
	onClose,
	onSubmit,
	supplier,
}: SupplierDialogProps) => {
	const { loading, stores } = useSupplier();
	const [data, setData] = useState<CreateSupplierDetails>({
		name: '',
		fromColor: '#6B7280',
		toColor: '#374151',
		description: '',
		cardTypes: ['physical', 'digital'],
		stores: [],
		...supplier,
		logo: null,
	});
	const [file, setFile] = useState<File | null>(null);
	const [storeInput, setStoreInput] = useState('');
	const [storeSearch, setStoreSearch] = useState('');
	const [deleteImage, setDeleteImage] = useState(false);
	const filteredStores = useMemo(() => {
		return stores.filter((store) =>
			store.name.toLowerCase().includes(storeSearch.toLowerCase())
		);
	}, [stores, storeSearch]);

	const colorRef = useRef(data.fromColor);

	const updateColor = useCallback(
		(color: string) => {
			setData((prev) => ({
				...prev,
				fromColor: color,
			}));
		},
		[setData]
	);

	const debouncedUpdateColor = useMemo(
		() => debounce(updateColor, 300),
		[updateColor]
	);

	const toggleCardType = (type: string) => {
		setData((prev) => {
			if (prev.cardTypes.includes(type)) {
				return {
					...prev,
					cardTypes: prev.cardTypes.filter((t) => t !== type),
				};
			} else {
				return {
					...prev,
					cardTypes: [...prev.cardTypes, type],
				};
			}
		});
	};

	const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		colorRef.current = value;
		debouncedUpdateColor(value);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const finalStores = data.stores.map((store) => {
			const existingStore = stores.find(
				(s) =>
					s.name.trim().toLowerCase() ===
					store.name.trim().toLowerCase()
			);

			if (existingStore) {
				return existingStore; // Use the full existing store object
			} else {
				return {
					name: store.name.trim(),
					address: '',
					image: '',
				};
			}
		});
		const success = await onSubmit({
			...data,
			toColor: getDarkerColor(data.fromColor),
			logo: file,
			stores: finalStores,
			deleteImage,
		});
		if (success) {
			onClose();
		}
	};

	const addStore = () => {
		if (
			storeInput.trim() &&
			!data.stores.some((store) => store.name === storeInput.trim())
		) {
			setData((prev) => ({
				...prev,
				stores: [...prev.stores, { name: storeInput.trim() }],
			}));
			setStoreInput('');
		}
	};

	const toggleStoreSelection = (store: string) => {
		if (store.trim() === '') return;

		const storeExists = data.stores.some((s) => s.name === store.trim());

		if (storeExists) {
			setData((prev) => ({
				...prev,
				stores: prev.stores.filter((s) => s.name !== store.trim()),
			}));
		} else {
			setData((prev) => ({
				...prev,
				stores: [...prev.stores, { name: store.trim() }],
			}));
		}
	};

	const removeStore = (index: number) => {
		setData((prev) => ({
			...prev,
			stores: prev.stores.filter((_, i) => i !== index),
		}));
	};

	const handleStoreKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addStore();
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add new Supplier</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleFormSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="expirationDate">
							Name <span className="text-red-500">*</span>
						</Label>
						<Input
							required
							type="text"
							id="name"
							name="name"
							onChange={handleInputChange}
							value={data.name}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							value={data.description}
							onChange={handleInputChange}
							placeholder="Add a description for this supplier"
							className="min-h-[80px]"
						/>
					</div>
					<div className="flex items-center justify-between space-y-0">
						<div className="flex items-center space-x-2">
							<Smartphone className="h-4 w-4" />
							<Label htmlFor="isPhysical">Physical Card</Label>
						</div>
						<Switch
							id="isPhysical"
							checked={data.cardTypes.includes('physical')}
							onCheckedChange={() => toggleCardType('physical')}
						/>
					</div>
					<div className="flex items-center justify-between space-y-0">
						<div className="flex items-center space-x-2">
							<CreditCard className="h-4 w-4" />
							<Label htmlFor="isDigital">Digital Card</Label>
						</div>
						<Switch
							id="isDigital"
							checked={data.cardTypes.includes('digital')}
							onCheckedChange={() => toggleCardType('digital')}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="expirationDate">
							Color <span className="text-red-500">*</span>
						</Label>
						<Input
							required
							type="color"
							id="color"
							name="color"
							onChange={handleColorChange}
							value={data.fromColor}
						/>
					</div>
					<div className="space-y-2">
						<SupplierImageInput
							setDeleteImage={setDeleteImage}
							setFile={setFile}
							defaultImage={supplier?.logo}
						/>
					</div>
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
							<Button type="button" size="sm" onClick={addStore}>
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
												checked={data.stores.some(
													(s) =>
														s.name ===
														store.name.trim()
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
						<div className="flex flex-wrap gap-2 mt-2">
							{data.stores.map((store, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="flex items-center gap-1"
								>
									{store.name}
									<X
										className="h-3 w-3 cursor-pointer"
										onClick={() => removeStore(index)}
									/>
								</Badge>
							))}
							{data.stores.length === 0 && (
								<span className="text-sm text-muted-foreground">
									No stores added yet
								</span>
							)}
						</div>
					</div>
					<div className="border-t pt-4">
						<details>
							<summary className="cursor-pointer text-sm font-medium mb-2">
								Preview
							</summary>
							<SupplierCard
								supplier={{
									...data,
									logo: file
										? URL.createObjectURL(file)
										: deleteImage
										? ''
										: supplier?.logo,
									_id: supplier?._id || '',
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
							Add Supplier
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default SupplierDialog;
