'use client';

import { useState, useEffect, useRef } from 'react';
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
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastError } from '../lib/utils';
import { useVerifyEmail } from '../hooks/useAuthQuery';

export default function ConfirmEmailPage() {
	const navigate = useNavigate();
	const { token } = useParams();

	const [isVerifying, setIsVerifying] = useState(true);
	const [isSuccess, setIsSuccess] = useState(false);
	const hasRun = useRef(false);

	const { mutateAsync: verifyEmail } = useVerifyEmail();

	useEffect(() => {
		if (hasRun.current) return;
		hasRun.current = true;

		const verify = async () => {
			setIsVerifying(true);

			// Check if token exists
			if (!token) {
				toast.error('Invalid verification link');
				setIsVerifying(false);
				return;
			}

			try {
				await verifyEmail(token);
				toast.success('Email verified successfully');
				setIsSuccess(true);
			} catch (error) {
				toastError(error);
			}
			setIsVerifying(false);
		};

		verify();
	}, [token, verifyEmail]);

	return (
		<div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center mb-4">
						{isVerifying ? (
							<div className="rounded-full bg-primary/10 p-3">
								<Loader2 className="h-8 w-8 text-primary animate-spin" />
							</div>
						) : isSuccess ? (
							<div className="rounded-full bg-green-100 p-3">
								<CheckCircle className="h-8 w-8 text-green-600" />
							</div>
						) : (
							<div className="rounded-full bg-red-100 p-3">
								<AlertCircle className="h-8 w-8 text-red-600" />
							</div>
						)}
					</div>
					<CardTitle className="text-2xl text-center">
						{isVerifying
							? 'Verifying Your Email'
							: isSuccess
							? 'Email Verified'
							: 'Verification Failed'}
					</CardTitle>
					<CardDescription className="text-center">
						{isVerifying
							? 'Please wait while we verify your email address...'
							: isSuccess
							? 'Your email has been successfully verified. You can now log in to your account.'
							: "We couldn't verify your email address. The link may be invalid or expired."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isVerifying ? (
						<div className="flex justify-center py-4">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : isSuccess ? (
						<Alert className="bg-green-50 text-green-800 border-green-200">
							<CheckCircle className="h-4 w-4" />
							<AlertDescription>
								Your account is now active. You can log in and
								start using the Gift Card Manager.
							</AlertDescription>
						</Alert>
					) : (
						<div className="text-center">
							<p className="text-sm text-muted-foreground mb-4">
								If you're having trouble verifying your email,
								you can request a new verification link.
							</p>
							<Button
								onClick={() => navigate('/verify-email')}
								className="w-full"
							>
								Request New Verification Link
							</Button>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-center">
					{isSuccess && (
						<Button
							onClick={() => navigate('/login')}
							className="w-full"
						>
							Proceed to Login
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
