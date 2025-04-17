import { GiftCardList } from '../components/GiftCardList';
import { SearchBar } from '../components/search-bar';
import { PlusCircle } from 'lucide-react';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { useState } from 'react';
import { CreateGiftCardDetails } from '../types/gift-card';
import { toast } from 'react-toastify';
import { toastError } from '../lib/utils';
import { createCard, createCardAndSupplier } from '../services/cardService';
import { useGiftCards } from '../hooks/useGiftCards';

export default function Home() {
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const { refetchCards } = useGiftCards();

	const handleAddCard = async (data: CreateGiftCardDetails) => {
		console.log('Card data:', data);
		if (!data) {
			toast.error('No data provided');
			return;
		}
		if (isNaN(data.amount) || data.amount <= 0) {
			toast.error('Amount must be greater than 0');
			return;
		}
		if (!data.name || !data.supplierId) {
			toast.error('Name and Supplier are required');
			return;
		}
		try {
			if (data.supplierId === 'other') {
				await createCardAndSupplier(
					data.name,
					data.supplier as string,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency,
					data.supportedStores.map((store) => ({
						name: store,
					})),
					null,
					[]
				);
			} else {
				await createCard(
					data.name,
					data.supplierId,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency
				);
			}
			refetchCards();
			setShowDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
			toastError(error);
		}
	};
	return (
		<main className="min-h-screen bg-[#0B0E14] text-white p-8">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">My Gift Cards</h1>

				<div className="flex justify-between items-center mb-8 space-x-4">
					<div className="flex-1 max-w-md">
						<SearchBar />
					</div>
					<button
						onClick={() => setShowDialog(true)}
						className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
					>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Gift Card
					</button>

					{showDialog && (
						<GiftCardDialog
							onSubmit={handleAddCard}
							onClose={() => setShowDialog(false)}
						/>
					)}
				</div>

				<GiftCardList />
			</div>
		</main>
	);
}
