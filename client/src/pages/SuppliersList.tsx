import { PlusCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../components/loading';
import { SupplierCard } from '../components/SupplierCard';
import SupplierDialog from '../components/SupplierDialog';
import { useCreateSupplier, useGetSuppliers } from '../hooks/useSupplierQuery';
import { toastError } from '../lib/utils';
import { CreateSupplierDetails } from '../types/supplier';

const SuppliersList = () => {
	const { data: suppliers, isLoading: loading, refetch, isRefetching } = useGetSuppliers();
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const navigate = useNavigate();
	
	const { mutateAsync: createSupplier, isPending: isCreating } = useCreateSupplier();

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
		try {
			await createSupplier(data);
			toast.success('Supplier created successfully');
			return true;
		} catch (error) {
			toastError(error);
			return false;
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<main className="bg-[#0B0E14] text-white p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center gap-4 mb-8 text-center">
					<div className="flex items-center gap-4">
						<h1 className="text-3xl font-bold">Suppliers</h1>
						<button
							onClick={() => refetch()}
							className="p-2 hover:bg-white/10 rounded-full transition-colors"
							title="Refresh suppliers"
						>
							<RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
						</button>
					</div>
					<button
						onClick={() => setShowDialog(true)}
						className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
					>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Supplier
					</button>
					{showDialog && (
						<SupplierDialog
							isLoading={isCreating}
							onSubmit={handleAddSupplier}
							onClose={() => setShowDialog(false)}
						/>
					)}
				</div>

				<div className="flex gap-6 flex-wrap w-full justify-center lg:justify-start">
					{suppliers?.map((supplier) => (
						<SupplierCard
							handleCardClick={handleSupplierClick}
							key={supplier.id}
							supplier={supplier}
						/>
					))}
				</div>
			</div>
		</main>
	);
};

export default SuppliersList;
