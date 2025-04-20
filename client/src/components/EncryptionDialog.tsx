import { useState } from 'react';
import { useEncryption } from '../context/EncryptionContext';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { toast } from 'react-toastify';
import { validateGlobalKey } from '../lib/cryptoHelpers';
import { useAuth } from '../hooks/useAuth';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface EncryptionDialogProps {
	onClose: () => void;
	onSave: (key: string) => void;
}
const EncryptionDialog = ({ onClose, onSave }: EncryptionDialogProps) => {
	const { setGlobalKey } = useEncryption();
	const { user } = useAuth();
	const [encryptionKey, setEncryptionKey] = useState<string>('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!encryptionKey) {
			toast.error('Please enter an encryption key');
			return;
		}
		if (!user) {
			toast.error('User not found');
			return;
		}
		if (!user.salt || !user.verifyToken) {
			toast.error('Unable to perform decryption');
			return;
		}
		if (!validateGlobalKey(user.verifyToken, encryptionKey, user.salt)) {
			toast.error('Invalid encryption key');
			return;
		}
		setGlobalKey(encryptionKey);
		onClose();
		onSave(encryptionKey);
	};

	return (
		<>
			<Dialog open={true} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Enter Encryption Key</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-6">
						<p>
							To view encrypted data, please enter the encryption
							key below.
						</p>
						<div className="space-y-2">
							<Label htmlFor="expirationDate">
								Encryption Key
							</Label>
							<Input
								required
								type="password"
								id="encryptionKey"
								name="encryptionKey"
								value={encryptionKey}
								onChange={(e) =>
									setEncryptionKey(e.target.value)
								}
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="w-full bg-teal-600 hover:bg-teal-700"
							>
								Decrypt
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default EncryptionDialog;
