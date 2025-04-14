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
import { Alert, AlertDescription } from '../components/ui/alert';
import { CreditCard, AlertCircle, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!password || !confirmPassword) {
			setError('Please fill in all fields');
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters long');
			return;
		}

		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			setSuccess(true);

			// Redirect to login after 3 seconds
			setTimeout(() => {
				navigate('/login');
			}, 3000);
		}, 1500);
	};

	// Check if token is valid
	if (!token) {
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
					{success ? (
						<Alert className="bg-green-50 text-green-800 border-green-200">
							<Check className="h-4 w-4" />
							<AlertDescription>
								Your password has been reset successfully. You
								will be redirected to the login page.
							</AlertDescription>
						</Alert>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="password">New Password</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Password must be at least 8 characters long
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
					)}
				</CardContent>
			</Card>
		</div>
	);
}
