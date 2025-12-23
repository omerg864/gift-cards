import { getCloudinaryUrl } from '@/lib/utils';
import { Supplier } from '@shared/types/supplier.types';
import { debounce } from 'lodash';
import { CreditCard, Smartphone } from 'lucide-react';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { getDarkerColor } from '../lib/colors';
import { CreateSupplierDetails } from '../types/supplier';
import { StoreListPicker } from './StoreListPicker';
import { SupplierCard } from './SupplierCard';
import SupplierImageInput from './SupplierImageInput';
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
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

interface SupplierDialogProps {
	supplier?: Supplier;
	onClose: () => void;
	onSubmit: (data: CreateSupplierDetails) => Promise<boolean>;
	confirmButtontext?: string;
}
const SupplierDialog = ({
	onClose,
	onSubmit,
	supplier,
	confirmButtontext = 'Add Supplier',
}: SupplierDialogProps) => {
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
	const [deleteImage, setDeleteImage] = useState(false);

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
			const existingStore = (supplier?.stores ?? []).find(
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

	const addStore = (storeName: string) => {
		if (
			storeName.trim() &&
			!data.stores.some((store) => store.name === storeName.trim())
		) {
			setData((prev) => ({
				...prev,
				stores: [...prev.stores, { name: storeName.trim() }],
			}));
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
					<StoreListPicker
						selectedStores={data.stores}
						onAddStore={addStore}
						onRemoveStore={removeStore}
						onToggleStore={toggleStoreSelection}
					/>
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
										: getCloudinaryUrl(supplier?.logo),
									id: supplier?.id || '',
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
							{confirmButtontext}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default SupplierDialog;
