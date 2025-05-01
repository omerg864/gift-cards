import { JSX, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EncryptionFormProps {
	handleEncryption: (
		newKey: string,
		confirmKey: string,
		currentKey: string
	) => Promise<boolean>;
	children?: JSX.Element;
	title?: string;
	description?: string;
	currentKeyActive?: boolean;
}

const EncryptionForm = ({
	handleEncryption,
	children,
	title,
	description,
	currentKeyActive = false,
}: EncryptionFormProps) => {
	const [currentKey, setCurrentKey] = useState('');
	const [newKey, setNewKey] = useState('');
	const [confirmKey, setConfirmKey] = useState('');

	const submitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		const success = await handleEncryption(newKey, confirmKey, currentKey);
		if (success) {
			setCurrentKey('');
			setNewKey('');
			setConfirmKey('');
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={submitForm} className="space-y-4">
					{currentKeyActive && (
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
					)}
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
					<div className="flex flex-col gap-4 md:flex-row md:justify-between">
						{children}
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default EncryptionForm;
