'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { CreditCard } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { email_regex, password_regex } from '../lib/regex';
import Loading from '../components/loading';
import { toastError } from '../lib/utils';
import { useResetPassword } from '../hooks/useAuthQuery';

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const { token, email } = useParams();

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	
	const { mutateAsync: resetUserPassword, isPending: isLoading } = useResetPassword();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		if (!password_regex.test(password)) {
			toast.error(
				'Password must be at least 8 characters long and contain at least one letter and one number'
			);
			return;
		}

		if (!token || !email || !email_regex.test(email)) {
			toast.error('Invalid or expired link');
			return;
		}

		try {
			await resetUserPassword({ token, email, password });
			toast.success('Password changed successfully');
			navigate('/login');
		} catch (error) {
			toastError(error);
		}
	};

	// Check if token is valid
	if (!token || !email || !email_regex.test(email)) {
		return (
			<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							Invalid Reset Link
						</CardTitle>
						<CardDescription className="text-center">
							This password reset link is invalid or has expired.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => navigate('/forgot-password')}
							className="w-full"
						>
							Request New Reset Link
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center mb-4">
						<div className="rounded-full bg-primary/10 p-3">
							<CreditCard className="h-8 w-8 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<p className="text-xs text-muted-foreground">
								Password must be at least 8 characters long and
								contain at least one letter and one number
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm New Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? 'Resetting...' : 'Reset Password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
