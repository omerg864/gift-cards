import { GiftCardList } from '../components/GiftCardList';
import { SearchBar } from '../components/SearchBar';
import { PlusCircle } from 'lucide-react';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { useState } from 'react';
import { CreateGiftCardDetails } from '../types/gift-card';
import { toast } from 'react-toastify';
import { toastError } from '../lib/utils';
import { createCard, createCardAndSupplier } from '../services/cardService';
import { useGiftCards } from '../hooks/useGiftCards';
import { useEncryption } from '../context/EncryptionContext';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/input';
import { setEncryptionKey as setEncryptionKeyServer } from '../services/userService';
import {
	encryptCard,
	generateSaltAndVerifyToken,
	validateGlobalKey,
} from '../lib/cryptoHelpers';
import { getDarkerColor } from '../lib/colors';

export default function Home() {
	const [showDialog, setShowDialog] = useState<boolean>(false);
	const [encryptionKey, setEncryptionKey] = useState<string>('');
	const [confirmEncryptionKey, setConfirmEncryptionKey] =
		useState<string>('');
	const { refetchCards } = useGiftCards();
	const { setGlobalKey } = useEncryption();
	const { user, updateUser } = useAuth();

	const handleAddCard = async (data: CreateGiftCardDetails) => {
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
		if (!user) {
			toast.error('unable to perform encryption');
			return;
		}

		if (!user.salt || !user.verifyToken) {
			toast.error('unable to perform encryption');
			return;
		}
		if (data.cvv || data.cardNumber) {
			if (!data.encryptionKey) {
				toast.error('Please provide encryption key');
				return;
			}
			if (
				!validateGlobalKey(
					user.verifyToken,
					data.encryptionKey,
					user.salt
				)
			) {
				toast.error('invalid encryption key');
				return;
			}
			setGlobalKey(data.encryptionKey);
		}
		let last4, cvv, cardNumber;
		if (data.cardNumber) {
			last4 = data.cardNumber.slice(-4);
		}
		if (data.cardNumber || data.cvv) {
			const encryptedData = encryptCard(
				{ cardNumber: data.cardNumber, cvv: data.cvv },
				data.encryptionKey,
				user.salt
			);
			cardNumber = encryptedData.cardNumber;
			cvv = encryptedData.cvv;
		}
		try {
			if (data.supplierId === 'other') {
				if (!data.supplier) {
					toast.error('Supplier name is required');
					return;
				}
				if (!data.fromColor) {
					toast.error('color is required');
					return;
				}
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
					[],
					data.fromColor,
					getDarkerColor(data.fromColor),
					cardNumber,
					last4,
					data.expiry,
					cvv
				);
			} else {
				await createCard(
					data.name,
					data.supplierId,
					data.description || '',
					data.isPhysical,
					data.amount,
					data.currency,
					cardNumber,
					last4,
					data.expiry,
					cvv
				);
			}
			refetchCards();
			setShowDialog(false);
			toast.success('Card added successfully');
		} catch (error) {
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
			await setEncryptionKeyServer(salt, verifyToken);
			updateUser({ salt, verifyToken });
			setGlobalKey(encryptionKey);
			toast.success('Encryption key set successfully');
		} catch (error) {
			toastError(error);
		}
	};

	if (user && !user?.verifyToken || !user?.salt) {
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
