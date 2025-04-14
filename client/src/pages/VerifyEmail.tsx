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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerifyEmailPage() {
	const [isResending, setIsResending] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [error, setError] = useState('');

	const handleResendEmail = () => {
		setIsResending(true);
		setError('');
		setResendSuccess(false);

		// Simulate API call
		setTimeout(() => {
			setIsResending(false);
			setResendSuccess(true);
		}, 1500);
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
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{resendSuccess && (
						<Alert className="bg-green-50 text-green-800 border-green-200">
							<Check className="h-4 w-4" />
							<AlertDescription>
								Verification email has been resent. Please check
								your inbox.
							</AlertDescription>
						</Alert>
					)}

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

					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-4">
							Didn't receive the email? Check your spam folder or
							click below to resend.
						</p>
						<Button
							onClick={handleResendEmail}
							disabled={isResending}
							variant="outline"
							className="w-full"
						>
							{isResending
								? 'Sending...'
								: 'Resend Verification Email'}
						</Button>
					</div>
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
