// src/context/SupplierContext.tsx
import React, {
	createContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
} from 'react';
import type { Store, Supplier } from '../types/supplier';
import { getSuppliers } from '../services/supplierService';
import { toastError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface SupplierContextType {
	suppliers: Supplier[];
	loading: boolean;
	refetchSuppliers: () => Promise<void>;
	stores: Store[];
}

export const SupplierContext = createContext<SupplierContextType | undefined>(
	undefined
);

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [stores, setStores] = useState<Store[]>([]);
	const [loading, setLoading] = useState(true);
	const hasRun = useRef(false);
	const { logout, user } = useAuth();

	const fetchSuppliers = async () => {
		setLoading(true);
		try {
			const data = await getSuppliers();
			setSuppliers(data.suppliers);
			const allStores = data.suppliers
				.flatMap((supplier) => supplier.stores) // flatten once
				.filter(
					(store, index, self) =>
						index === self.findIndex((s) => s.name === store.name) // keep only first occurrence
				);

			setStores(allStores);
		} catch (error) {
			if ((error as Error).message === 'Please login') {
				logout();
				return;
			}
			toastError(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (user && !hasRun.current) {
			hasRun.current = true;
			fetchSuppliers();
		}
	}, [user]);

	return (
		<SupplierContext.Provider
			value={{
				suppliers,
				loading,
				refetchSuppliers: fetchSuppliers,
				stores,
			}}
		>
			{children}
		</SupplierContext.Provider>
	);
};
