import { useContext } from 'react';
import { SupplierContext } from '../context/SupplierContext';

export const useSupplier = () => {
	const context = useContext(SupplierContext);
	if (!context) {
		throw new Error(
			'useSupplierContext must be used within a SupplierProvider'
		);
	}
	return context;
};
