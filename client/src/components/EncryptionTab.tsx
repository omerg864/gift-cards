import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useEncryption } from '../context/EncryptionContext';
import { useGiftCards } from '../hooks/useGiftCards';
import {
	decryptCardFields,
	encryptCard,
	generateSaltAndVerifyToken,
	validateGlobalKey,
} from '../lib/cryptoHelpers';
import { updateEncryptionKey } from '../services/userService';
import { toastError } from '../lib/utils';
import Loading from './loading';
import EncryptionForm from './EncryptionForm';

const EncryptionTab = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { user, updateUser } = useAuth();
	const { setGlobalKey } = useEncryption();
	const { giftCards, updateCards } = useGiftCards();
	const [resetKeyForm, setResetKeyForm] = useState(false);

	const handleEncryptionUpdate = async (
		newKey: string,
		confirmKey: string,
		currentKey: string
	) => {
		if (!user) {
			toast.error('User not found');
			return false;
		}
		if (!user.salt || !user.verifyToken) {
			toast.error('User encryption data not found');
			return false;
		}

		if (!currentKey || !newKey || !confirmKey) {
			toast.error('All Encryption fields are required');
			return false;
		}
		if (!validateGlobalKey(user.verifyToken, currentKey, user.salt)) {
			toast.error('Current Encryption Key is incorrect');
			return false;
		}

		if (newKey !== confirmKey) {
			toast.error('New encryption keys do not match');
			return false;
		}

		const { salt, verifyToken } = generateSaltAndVerifyToken(newKey);

		const updatedCards = giftCards
			.filter((card) => card.cardNumber || card.cvv)
			.map((card) => {
				const decryptedCard = {
					_id: card._id,
					...encryptCard(
						decryptCardFields(card, currentKey, user.salt!),
						newKey,
						salt
					),
				};
				return decryptedCard;
			});

		setIsLoading(true);
		try {
			await updateEncryptionKey(salt, verifyToken, updatedCards);
			updateCards(updatedCards);
			setGlobalKey(newKey);
			updateUser({
				salt,
				verifyToken,
			});
			toast.success('Encryption Key updated successfully');
		} catch (error) {
			toastError(error);
			return false;
		}
		setIsLoading(false);
		return true;
	};

	const handleEncryptionReset = async (
		newKey: string,
		confirmKey: string
	) => {
		if (!user) {
			toast.error('User not found');
			return false;
		}
		if (!user.salt || !user.verifyToken) {
			toast.error('User encryption data not found');
			return false;
		}

		if (!newKey || !confirmKey) {
			toast.error('All Encryption fields are required');
			return false;
		}

		if (newKey !== confirmKey) {
			toast.error('New encryption keys do not match');
			return false;
		}

		const { salt, verifyToken } = generateSaltAndVerifyToken(newKey);

		const updatedCards = giftCards
			.filter((card) => card.cardNumber || card.cvv)
			.map((card) => {
				const decryptedCard = {
					_id: card._id,
					cvv: '',
					cardNumber: '',
					last4: '',
				};
				return decryptedCard;
			});

		setIsLoading(true);
		try {
			await updateEncryptionKey(salt, verifyToken, updatedCards);
			updateCards(updatedCards);
			setGlobalKey(newKey);
			updateUser({
				salt,
				verifyToken,
			});
			toast.success('Encryption Key updated successfully');
		} catch (error) {
			toastError(error);
			return false;
		}
		setIsLoading(false);
		return true;
	};

	if (isLoading) {
		return <Loading />;
	}

	if (resetKeyForm) {
		return (
			<EncryptionForm
				title="Reset Encryption Key"
				description="Reset your Encryption Key. This will erase all encrypted data on your cards."
				handleEncryption={handleEncryptionReset}
			>
				<>
					<Button type="submit" variant="destructive">
						Reset Encryption Key
					</Button>
					<Button
						type="button"
						onClick={() => setResetKeyForm(false)}
						variant="secondary"
					>
						cancel
					</Button>
				</>
			</EncryptionForm>
		);
	}

	return (
		<EncryptionForm
			title="Change Encryption Key"
			description="Update your Encryption Key for all of your cards."
			currentKeyActive={true}
			handleEncryption={handleEncryptionUpdate}
		>
			<>
				<Button type="submit">Update Encryption Key</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={() => setResetKeyForm(true)}
				>
					Reset Encryption Key
				</Button>
			</>
		</EncryptionForm>
	);
};

export default EncryptionTab;
