import { useState } from 'react';
import { useSupplier } from '../hooks/useSupplier';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/loading';
import { PlusCircle } from 'lucide-react';
import SupplierDialog from '../components/SupplierDialog';
import { CreateSupplierDetails } from '../types/supplier';
import { SupplierCard } from '../components/SupplierCard';
import { toast } from 'react-toastify';
import { createUserSupplier } from '../services/supplierService';
import { toastError } from '../lib/utils';

const SuppliersList = () => {
	const { suppliers, loading, refetchSuppliers } = useSupplier();
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	const handleSupplierClick = (supplierId: string) => {
		navigate(`/supplier/${supplierId}`);
	};

	const handleAddSupplier = async (
		data: CreateSupplierDetails
	): Promise<boolean> => {
		if (!data) {
			toast.error('No data provided');
			return false;
		}
		if (!data.name || !data.fromColor || !data.toColor) {
			toast.error('Please provide all required fields');
			return false;
		}
		if (!data.cardTypes || data.cardTypes.length === 0) {
			toast.error('At least one Card type is required');
			return false;
		}
		setIsLoading(true);
		try {
			await createUserSupplier(data);
			await refetchSuppliers();
			toast.success('Supplier created successfully');
			setIsLoading(false);
			return true;
		} catch (error) {
			toastError(error);
			setIsLoading(false);
			return false;
		}
	};

	if (loading || isLoading) {
		return <Loading />;
	}

	return (
		<main className="bg-[#0B0E14] text-white p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center gap-4 mb-8 text-center">
					<h1 className="text-3xl font-bold">Suppliers</h1>
					<button
						onClick={() => setShowDialog(true)}
						className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
					>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Supplier
					</button>
					{showDialog && (
						<SupplierDialog
							onSubmit={handleAddSupplier}
							onClose={() => setShowDialog(false)}
						/>
					)}
				</div>

				<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
					{suppliers.map((supplier) => (
						<SupplierCard
							handleCardClick={handleSupplierClick}
							key={supplier._id}
							supplier={supplier}
						/>
					))}
				</div>
			</div>
		</main>
	);
};

export default SuppliersList;
