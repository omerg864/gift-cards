import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button';

interface GoogleLoginProps {
	authResponse: (authResult: any) => void;
	isLoading: boolean;
}

function GoogleLogin({ authResponse, isLoading }: GoogleLoginProps) {
	const googleLogin = useGoogleLogin({
		onSuccess: authResponse,
		onError: authResponse,
		flow: 'auth-code',
	});

	return (
		<Button
			type="button"
			variant="outline"
			className="w-full flex items-center justify-center gap-2"
			onClick={googleLogin}
			disabled={isLoading}
		>
			<svg
				viewBox="0 0 533.5 544.3"
				xmlns="http://www.w3.org/2000/svg"
				fill="white"
			>
				<path d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.4h146.9c-6.4 34.6-25.1 63.9-53.5 83.5v69.4h86.4c50.6-46.6 81.7-115.3 81.7-197.9z" />
				<path d="M272 544.3c72.6 0 133.6-24.1 178.1-65.6l-86.4-69.4c-24 16.1-54.6 25.5-91.7 25.5-70.4 0-130.1-47.6-151.5-111.3H31v69.9c44.4 87.5 134.9 150.9 241 150.9z" />
				<path d="M120.5 323.5c-10.6-31.6-10.6-65.4 0-97L31 156.6C-10.2 233.4-10.2 310.9 31 387.6l89.5-64.1z" />
				<path d="M272 107.7c39.5 0 75.2 13.6 103.2 40.3l77.4-77.4C405.6 24.1 344.6 0 272 0 165.9 0 75.4 63.4 31 150.9l89.5 69.9C141.9 155.3 201.6 107.7 272 107.7z" />
			</svg>
			Sign in with Google
		</Button>
	);
}

export default GoogleLogin;
