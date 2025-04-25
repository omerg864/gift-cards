// src/context/SupplierContext.tsx
import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import type { Supplier } from '../types/supplier';
import { getSuppliers } from '../services/supplierService';
import { toastError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface SupplierContextType {
	suppliers: Supplier[];
	loading: boolean;
	refetchSuppliers: () => void;
}

export const SupplierContext = createContext<SupplierContextType | undefined>(
	undefined
);

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(true);
	const hasRun = useRef(false);
	const { logout, user } = useAuth();

	const fetchSuppliers = async () => {
		setLoading(true);
		try {
			const data = await getSuppliers();
			setSuppliers(data.suppliers);
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
			value={{ suppliers, loading, refetchSuppliers: fetchSuppliers }}
		>
			{children}
		</SupplierContext.Provider>
	);
};
