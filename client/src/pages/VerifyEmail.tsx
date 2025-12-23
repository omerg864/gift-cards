'use client';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { toast } from 'react-toastify';
import { email_regex } from '../lib/regex';
import { toastError } from '../lib/utils';
import { useResendVerification } from '../hooks/useAuthQuery';

export default function VerifyEmailPage() {
	const { email: authEmail } = useAuth();
	const [email, setEmail] = useState<string | null>(authEmail);

	const { mutateAsync: resendEmail, isPending: isLoading } = useResendVerification();

	const handleResendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email) {
			toast.error('Email is required');
			return;
		}
		if (!email_regex.test(email)) {
			toast.error('Invalid email address');
			return;
		}
		try {
			const data = await resendEmail(email);

			if (data.sent) {
				toast.success('Verification email sent successfully');
			} else {
				toast.error('Failed to send verification email');
			}
		} catch (error) {
			toastError(error);
		}
	};

	return (
		<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center mb-4">
						<div className="rounded-full bg-primary/10 p-3">
							<Mail className="h-8 w-8 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl text-center">
						Verify Your Email
					</CardTitle>
					<CardDescription className="text-center">
						We've sent a verification email to your inbox. Please
						check your email and click the verification link.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-muted/50 p-4 rounded-lg">
						<h3 className="font-medium mb-2">What to do next:</h3>
						<ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
							<li>
								Check your email inbox for the verification link
							</li>
							<li>
								Click the link in the email to verify your
								account
							</li>
							<li>
								If you don't see the email, check your spam
								folder
							</li>
							<li>
								Once verified, you can log in to your account
							</li>
						</ol>
					</div>

					<form className="text-center" onSubmit={handleResendEmail}>
						<p className="text-sm text-muted-foreground mb-4">
							Didn't receive the email? Check your spam folder or
							click below to resend.
						</p>
						<div className="space-y-2 mb-4 text-start">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email || ''}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<Button
							type="submit"
							disabled={isLoading}
							variant="outline"
							className="w-full"
						>
							{isLoading
								? 'Sending...'
								: 'Resend Verification Email'}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col">
					<div className="text-center text-sm text-muted-foreground mt-2">
						<Link
							to="/login"
							className="text-primary hover:underline"
						>
							Back to login
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
