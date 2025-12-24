import { Card } from '@shared/types/card.types';
import { Supplier } from '@shared/types/supplier.types';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { GiftCardList } from '../components/GiftCardList';
import { SearchBar } from '../components/SearchBar';
import { Input } from '../components/ui/input';
import { useEncryption } from '../context/EncryptionContext';
import { useAuth } from '../hooks/useAuth';
import { useCreateCardAndSupplier } from '../hooks/useCardQuery';
import { useSetEncryptionKey } from '../hooks/useUserQuery';
import {
	encryptCard,
	generateSaltAndVerifyToken,
	validateGlobalKey,
} from '../lib/cryptoHelpers';
import { toastError } from '../lib/utils';

export default function Home() {
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const [encryptionKey, setEncryptionKey] = useState<string>('');
	const [confirmEncryptionKey, setConfirmEncryptionKey] =
		useState<string>('');
	const { setGlobalKey, globalKey } = useEncryption();
	const { user, updateUser, isAuthenticated } = useAuth();
	const createCardAndSupplierMutation = useCreateCardAndSupplier();
	const setEncryptionKeyMutation = useSetEncryptionKey();

	const handleAddCard = async (card: Card, supplier: Omit<Supplier, 'id'> | null) => {
		if (!card) {
			toast.error('No data provided');
			return;
		}
		if (isNaN(card.amount) || card.amount <= 0) {
			toast.error('Amount must be greater than 0');
			return;
		}
		if (!card.name) {
			toast.error('Name and Supplier are required');
			return;
		}
		if (!user) {
			toast.error('unable to perform encryption');
			return;
		}

		if (!user.salt || !user.verifyToken) {
			toast.error('unable to perform encryption');
			return;
		}
		if (card.cvv || card.cardNumber) {
			if (!globalKey) {
				toast.error('Please provide encryption key');
				return;
			}
			if (
				!validateGlobalKey(
					user.verifyToken,
					globalKey,
					user.salt
				)
			) {
				toast.error('invalid encryption key');
				return;
			}
		}
		let last4: string | undefined, cvv: string | undefined, cardNumber: string | undefined;
		if (card.cardNumber) {
			last4 = card.cardNumber.slice(-4);
		}
		if (card.cardNumber || card.cvv) {
			const encryptedData = encryptCard(
				{ cardNumber: card.cardNumber, cvv: card.cvv },
				encryptionKey,
				user.salt
			);
			cardNumber = encryptedData.cardNumber;
			cvv = encryptedData.cvv;
		}
		try {
				await createCardAndSupplierMutation.mutateAsync({
					card: {
						name: card.name,
						description: card.description || '',
						isPhysical: card.isPhysical,
						amount: card.amount,
						currency: card.currency,
					supplier: card.supplier,
					cardNumber,
					last4,
					expiry: card.expiry,
					cvv
					},
					supplier: supplier ?? undefined
				});
			setShowDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
			console.error('Error adding card:', error);
			toastError(error);
		}
	};

	const saveEncryptionKey = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!encryptionKey) {
			toast.error('Encryption key is required');
			return;
		}
		if (encryptionKey !== confirmEncryptionKey) {
			toast.error('Encryption keys do not match');
			return;
		}

		const { salt, verifyToken } = generateSaltAndVerifyToken(encryptionKey);

		try {
			await setEncryptionKeyMutation.mutateAsync({ salt, verifyToken });
			updateUser({ salt, verifyToken });
			setGlobalKey(encryptionKey);
			toast.success('Encryption key set successfully');
		} catch (error) {
			toastError(error);
		}
	};

	if (isAuthenticated && user && (!user?.verifyToken || !user?.salt)) {
		return (
			<main className="bg-[#0B0E14] text-white p-8">
				<div className="max-w-7xl mx-auto">
					<div className="bg-[#1A1D23] p-6 rounded-md shadow-md">
						<h2 className="text-2xl font-semibold mb-4">
							Set Your Encryption Key
						</h2>
						<p className="text-sm text-gray-400 mb-6">
							This encryption key will be used to securely encrypt
							the card number and CVV of your gift cards. Please
							note that this key cannot be recovered if lost.
						</p>
						<form onSubmit={saveEncryptionKey}>
							<div className="mb-4">
								<label
									htmlFor="encryptionKey"
									className="block text-sm font-medium mb-2"
								>
									Encryption Key
								</label>
								<Input
									type="password"
									id="encryptionKey"
									placeholder="Enter encryption key"
									className="w-full"
									required
									value={encryptionKey}
									onChange={(e) =>
										setEncryptionKey(e.target.value)
									}
								/>
							</div>
							<div className="mb-4">
								<label
									htmlFor="confirmEncryptionKey"
									className="block text-sm font-medium mb-2"
								>
									Confirm Encryption Key
								</label>
								<Input
									type="password"
									id="confirmEncryptionKey"
									placeholder="Confirm encryption key"
									className="w-full"
									required
									value={confirmEncryptionKey}
									onChange={(e) =>
										setConfirmEncryptionKey(e.target.value)
									}
								/>
							</div>
							<button
								type="submit"
								className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Set Encryption Key
							</button>
						</form>
					</div>
				</div>
			</main>
		);
	}
	return (
		<main className="bg-[#0B0E14] text-white p-8">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">My Gift Cards</h1>

				<div className="flex justify-between items-center gap-4 mb-8 sm:flex-row flex-col-reverse">
					<div className="flex-1 sm:max-w-md w-full">
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
