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
import { CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
	const navigate = useNavigate();
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleGoogleLogin = () => {
		// In a real app, this would redirect to Google OAuth
		// For demo purposes, we'll simulate a successful login
		login('demo@example.com', 'password123')
			.then((success) => {
				if (success) {
					navigate('/');
				}
			})
			.catch((err) => {
				setError('An error occurred during Google login');
				console.error(err);
			});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!email || !password) {
			setError('Please enter both email and password');
			return;
		}

		try {
			const success = await login(email, password);
			if (success) {
				navigate('/');
			} else {
				setError('Invalid email or password');
			}
		} catch (err) {
			setError('An error occurred during login');
			console.error(err);
		}
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
						Welcome back
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email and password to access your gift cards
					</CardDescription>
				</CardHeader>
				<CardContent>
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
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<Link
									to="/forgot-password"
									className="text-xs text-primary hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? 'Logging in...' : 'Log in'}
						</Button>

						{/* Add Google sign-in button */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							className="w-full flex items-center justify-center gap-2"
							onClick={handleGoogleLogin}
							disabled={isLoading}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-chrome"
							>
								<circle cx="12" cy="12" r="10" />
								<circle cx="12" cy="12" r="4" />
								<line x1="21.17" y1="8" x2="12" y2="8" />
								<line x1="3.95" y1="6.06" x2="8.54" y2="14" />
								<line
									x1="10.88"
									y1="21.94"
									x2="15.46"
									y2="14"
								/>
							</svg>
							Sign in with Google
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col">
					<div className="text-center text-sm text-muted-foreground mt-2">
						Don&apos;t have an account?{' '}
						<Link
							to="/register"
							className="text-primary hover:underline"
						>
							Register
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
