import { useState } from 'react';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useEncryption } from '../context/EncryptionContext';

const EncryptionTab = () => {
	const [currentKey, setCurrentKey] = useState('');
	const [newKey, setNewKey] = useState('');
	const [confirmKey, setConfirmKey] = useState('');
	const { user, updateUser } = useAuth();
	const { setGlobalKey } = useEncryption();

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!currentKey || !newKey || !confirmKey) {
			toast.error('All password fields are required');
			return;
		}

		if (newKey !== confirmKey) {
			toast.error('New passwords do not match');
			return;
		}

		// In a real app, this would validate the current password and update with the new one
		toast.success('Password updated successfully');
		setCurrentKey('');
		setNewKey('');
		setConfirmKey('');
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Encryption Key</CardTitle>
				<CardDescription>
					Update your Encryption Key for all of your cards.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handlePasswordUpdate} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="currentKey">
							Current Encryption Key
						</Label>
						<Input
							id="currentKey"
							type="password"
							value={currentKey}
							onChange={(e) => setCurrentKey(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="newKey">New Encryption Key</Label>
						<Input
							id="newKey"
							type="password"
							value={newKey}
							onChange={(e) => setNewKey(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmKey">
							Confirm New Encryption Key
						</Label>
						<Input
							id="confirmKey"
							type="password"
							value={confirmKey}
							onChange={(e) => setConfirmKey(e.target.value)}
							required
						/>
					</div>
					<Button type="submit">Update Encryption Key</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default EncryptionTab;
