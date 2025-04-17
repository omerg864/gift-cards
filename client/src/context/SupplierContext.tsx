// src/context/SupplierContext.tsx
import React, {
	createContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import type { Supplier } from '../types/supplier';
import { getSuppliers } from '../services/supplierService';
import { toastError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
	const { logout } = useAuth();
	const navigate = useNavigate();

	const fetchSuppliers = async () => {
		setLoading(true);
		try {
			const data = await getSuppliers();
			setSuppliers(data.suppliers);
		} catch (error) {
			if ((error as Error).message === 'Please login') {
				logout();
				navigate('/login');
				return;
			}
			toastError(error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchSuppliers();
	}, []);

	return (
		<SupplierContext.Provider
			value={{ suppliers, loading, refetchSuppliers: fetchSuppliers }}
		>
			{children}
		</SupplierContext.Provider>
	);
};