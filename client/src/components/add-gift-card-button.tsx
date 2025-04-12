'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { AddGiftCardDialog } from '../components/add-gift-card-dialog';

export function AddGiftCardButton() {
	const [showDialog, setShowDialog] = useState(false);

	return (
		<>
			<button
				onClick={() => setShowDialog(true)}
				className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
			>
				<PlusCircle className="mr-2 h-4 w-4" />
				Add Gift Card
			</button>

			{showDialog && (
				<AddGiftCardDialog onClose={() => setShowDialog(false)} />
			)}
		</>
	);
}
