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
import { CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { email_regex } from '../lib/regex';
import Loading from '../components/loading';
import { getDeviceDetails, toastError } from '../lib/utils';
import GoogleLogin from '../components/GoogleLoginButton';
import { useLogin, useGoogleLogin } from '../hooks/useAuthQuery';

export default function LoginPage() {
	const navigate = useNavigate();
	const { setUser, setEmail: setAuthEmail, handleAuthentication } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	
	const { mutateAsync: loginUser, isPending: isLoginPending } = useLogin();
	const { mutateAsync: loginGoogle, isPending: isGooglePending } = useGoogleLogin();

	const isLoading = isLoginPending || isGooglePending;

	const handleGoogleLogin = async (authResult: any) => {
		if (authResult?.code) {
			try {
				const device = getDeviceDetails();
				const data = await loginGoogle({ code: authResult.code, device });
				if (data) {
					setUser(data.user);
					handleAuthentication(true);
					toast.success('Logged in successfully');
					navigate('/');
				}
			} catch (error) {
				toastError(error);
			}
		} else {
			toast.error('Google login failed');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const device = getDeviceDetails();

		if (!email || !password) {
			toast.error('Please enter your email and password');
			return;
		}

		if (!email_regex.test(email)) {
			toast.error('Please enter a valid email address');
			return;
		}

		try {
			const data = await loginUser({ email, password, device });
			if (data) {
				setUser(data.user);
				handleAuthentication(true);
				toast.success('Logged in successfully');
				navigate('/');
			}
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === 'Please verify your email'
			) {
				setAuthEmail(email);
				toast.error('Please verify your email');
				navigate('/verify-email');
				return;
			}
			toastError(error);
		}
	};

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
						Welcome back
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email and password to access your gift cards
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
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

						<GoogleLogin
							authResponse={handleGoogleLogin}
							isLoading={isLoading}
						/>
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
