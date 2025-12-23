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
import { password_regex } from '../lib/regex';
import Loading from './loading';
import { useUpdateUserPassword } from '../hooks/useUserQuery';
import { toastError } from '../lib/utils';

const PasswordTab = () => {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const updateUserPasswordMutation = useUpdateUserPassword();

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newPassword || !confirmPassword) {
			toast.error('All password fields are required');
			return;
		}
		if (!password_regex.test(newPassword)) {
			toast.error(
				'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one number'
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('New passwords do not match');
			return;
		}
		setIsLoading(true);
		try {
			await updateUserPasswordMutation.mutateAsync(newPassword);
			toast.success('Password updated successfully');
			setNewPassword('');
			setConfirmPassword('');
		} catch (error) {
			toastError(error);
		}
		setIsLoading(false);
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Change Password</CardTitle>
				<CardDescription>Update your password</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handlePasswordUpdate} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="newPassword">New Password</Label>
						<Input
							id="newPassword"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm New Password
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>
					<Button type="submit">Update Password</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default PasswordTab;
