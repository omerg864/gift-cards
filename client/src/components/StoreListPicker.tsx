import { SupplierStore } from '@shared/types/supplier.types';
import { Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGetSuppliers } from '../hooks/useSupplierQuery';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';

interface StoreListPickerProps {
	selectedStores: SupplierStore[];
	onAddStore: (storeName: string) => void;
	onRemoveStore: (index: number) => void;
	onToggleStore: (storeName: string) => void;
}

export function StoreListPicker({
	selectedStores,
	onAddStore,
	onRemoveStore,
	onToggleStore,
}: StoreListPickerProps) {
	const [storeInput, setStoreInput] = useState('');
	const [storeSearch, setStoreSearch] = useState('');
	const { data: suppliers } = useGetSuppliers();

	const filteredStores = useMemo(() => {
		const allStores = suppliers?.flatMap((s) => s.stores ?? []) ?? [];
		// Remove duplicates based on store name
		const uniqueStores = Array.from(
			new Map(allStores.map((store) => [store.name, store])).values()
		);
		return uniqueStores.filter((store) =>
			store.name.toLowerCase().includes(storeSearch.toLowerCase())
		);
	}, [suppliers, storeSearch]);

	const handleAddStore = () => {
		if (storeInput.trim()) {
			onAddStore(storeInput.trim());
			setStoreInput('');
		}
	};

	const handleStoreKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddStore();
		}
	};

	return (
		<div className="space-y-3 border rounded-md p-3">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Input
						placeholder="Add custom store"
						value={storeInput}
						onChange={(e) => setStoreInput(e.target.value)}
						onKeyDown={handleStoreKeyDown}
					/>
				</div>
				<Button type="button" size="sm" onClick={handleAddStore}>
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
						onChange={(e) => setStoreSearch(e.target.value)}
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
									checked={selectedStores.some(
										(s) => s.name === store.name.trim()
									)}
									onCheckedChange={() =>
										onToggleStore(store.name)
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
				{selectedStores.map((store, index) => (
					<Badge
						key={index}
						variant="secondary"
						className="flex items-center gap-1"
					>
						{store.name}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() => onRemoveStore(index)}
						/>
					</Badge>
				))}
				{selectedStores.length === 0 && (
					<span className="text-sm text-muted-foreground">
						No stores added yet
					</span>
				)}
			</div>
		</div>
	);
}
