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
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLogin from '../components/GoogleLoginButton';
import Loading from '../components/loading';
import { getDeviceDetails, toastError } from '../lib/utils';
import { googleLogin, LoginResponse, register } from '../services/userService';
import { toast } from 'react-toastify';
import {
	ACCESS_TOKEN,
	AUTH_EXPIRATION,
	REFRESH_TOKEN,
	USER,
} from '../lib/constants';
import { email_regex, password_regex } from '../lib/regex';

export default function RegisterPage() {
	const { setUser, setEmail: setAuthEmail } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const successfulLogin = (data: LoginResponse) => {
		localStorage.setItem(USER, JSON.stringify(data.user));
		localStorage.setItem(ACCESS_TOKEN, data.accessToken);
		localStorage.setItem(REFRESH_TOKEN, data.refreshToken);
		const expiresIn = 50 * 60 * 1000;
		localStorage.setItem(
			AUTH_EXPIRATION,
			new Date(Date.now() + expiresIn).toISOString()
		);
		toast.success('Logged in successfully');
		setUser(data.user);
		navigate('/');
	};

	// Add Google registration function
	const handleGoogle = async (authResult: any) => {
		if (authResult?.code) {
			setIsLoading(true);
			try {
				const device = getDeviceDetails();
				const data = await googleLogin(authResult.code, device);
				successfulLogin(data);
			} catch (error) {
				toastError(error);
			}
			setIsLoading(false);
		} else {
			toast.error('Google login failed');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name || !email || !password) {
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

		if (!email_regex.test(email)) {
			toast.error('Invalid email format');
			return;
		}

		setIsLoading(true);
		try {
			const data = await register(email, password, name);
			setAuthEmail(email);
			if (data.sent) {
				toast.success(
					'Registration successful! Please verify your email.'
				);
			} else {
				toast.error(
					"Registration Successful! However, we couldn't send a verification email. Please resend it."
				);
			}
			navigate('/verify-email');
		} catch (error) {
			toastError(error);
		}
		setIsLoading(false);
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
						Create an account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
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
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm Password
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
							{isLoading ? 'Creating account...' : 'Register'}
						</Button>

						{/* Add Google sign-up button */}
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
							authResponse={handleGoogle}
							isLoading={isLoading}
						/>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col">
					<div className="text-center text-sm text-muted-foreground mt-2">
						Already have an account?{' '}
						<Link
							to="/login"
							className="text-primary hover:underline"
						>
							Log in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
