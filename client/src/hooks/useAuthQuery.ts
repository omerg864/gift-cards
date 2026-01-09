import { ROUTES } from '@shared/constants/routes';
import { CreateUserDto, LoginUserDto } from '@shared/types/user.types';
import { useMutation } from '@tanstack/react-query';
import { Device } from '../../../shared/types/device.types';
import { EMAIL, USER } from '../lib/constants';
import { axiosClient, generateLink } from '../services/client';

export const useLogin = () => {
	return useMutation({
		mutationFn: async (data: LoginUserDto) => {
			const response = await axiosClient.post(
				generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.LOGIN] }),
				data
			);
			return response.data;
		},
	});
};

export const useRegister = () => {
	return useMutation({
		mutationFn: async (data: CreateUserDto) => {
			const response = await axiosClient.post(
				generateLink({
					route: [ROUTES.AUTH.BASE, ROUTES.AUTH.REGISTER],
				}),
				data
			);
			return response.data;
		},
	});
};

export const useLogout = () => {
	return useMutation({
		mutationFn: async () => {
			await axiosClient.post(
				generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.LOGOUT] })
			);
		},
		onSuccess: () => {
			localStorage.removeItem(USER);
			localStorage.removeItem(EMAIL);
			localStorage.setItem('isAuthenticated', 'false');
			window.location.href = '/login';
		},
	});
};

export const useGoogleLogin = () => {
	return useMutation({
		mutationFn: async (data: { code: string; device: Device }) => {
			const response = await axiosClient.post(
				generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.AUTH.GOOGLE] }),
				data
			);
			return response.data;
		},
	});
};

export const useVerifyEmail = () => {
	return useMutation({
		mutationFn: async (token: string) => {
			const response = await axiosClient.get(
				generateLink({
					route: [ROUTES.AUTH.BASE, ROUTES.AUTH.VERIFY_EMAIL],
					params: { id: token },
				})
			);
			return response.data;
		},
	});
};

export const useResendVerification = () => {
	return useMutation({
		mutationFn: async (email: string) => {
			const response = await axiosClient.post(
				generateLink({
					route: [ROUTES.AUTH.BASE, ROUTES.AUTH.RESEND_EMAIL],
				}),
				{ email }
			);
			return response.data;
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: async (email: string) => {
			const response = await axiosClient.post(
				generateLink({
					route: [ROUTES.AUTH.BASE, ROUTES.AUTH.FORGOT_PASSWORD],
				}),
				{ email }
			);
			return response.data;
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: async ({
			token,
			password,
			email,
		}: {
			token: string;
			password: string;
			email: string;
		}) => {
			const response = await axiosClient.post(
				generateLink({
					route: [ROUTES.AUTH.BASE, ROUTES.AUTH.RESET_PASSWORD],
					params: { email },
				}),
				{ token, password }
			);
			return response.data;
		},
	});
};
