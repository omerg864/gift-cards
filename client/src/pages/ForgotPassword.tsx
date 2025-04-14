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
	CardFooter,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CreditCard, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess(false);

		if (!email) {
			setError('Please enter your email address');
			return;
		}

		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			setSuccess(true);
		}, 1500);
	};

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
						Forgot Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email address and we'll send you a link to
						reset your password
					</CardDescription>
				</CardHeader>
				<CardContent>
					{success ? (
						<div className="space-y-4">
							<Alert className="bg-green-50 text-green-800 border-green-200">
								<Check className="h-4 w-4" />
								<AlertDescription>
									If an account exists with the email{' '}
									<strong>{email}</strong>, we've sent
									password reset instructions.
								</AlertDescription>
							</Alert>
							<div className="text-center text-sm text-muted-foreground mt-4">
								Didn't receive the email? Check your spam folder
								or{' '}
								<button
									onClick={handleSubmit}
									className="text-primary hover:underline font-medium"
								>
									try again
								</button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? 'Sending...' : 'Send Reset Link'}
							</Button>
						</form>
					)}
				</CardContent>
				<CardFooter className="flex flex-col">
					<div className="text-center text-sm text-muted-foreground mt-2">
						<Link
							to="/login"
							className="text-primary hover:underline flex items-center justify-center"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to login
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
