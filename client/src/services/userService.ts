import axios from 'axios';
import { DeviceDetails } from '../types/user';
import { client, checkToken } from './client';

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	success: boolean;
}

export interface RegisterResponse {
	sent: boolean;
	message: string;
	success: boolean;
}

export interface ResendVerificationResponse {
	sent: boolean;
	success: boolean;
}

const errorHandler = (error: unknown): never => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message || 'Login failed';
		throw new Error(message);
	} else {
		throw new Error('Unexpected error during login');
	}
};

const login = async (
	email: string,
	password: string,
	device: DeviceDetails
): Promise<LoginResponse> => {
	try {
		const response = await client.post<LoginResponse>('/user/login', {
			email,
			password,
			device,
		});
		return response.data;
	} catch (error) {
		return errorHandler(error);
	}
};

const googleLogin = async (
	code: string,
	device: DeviceDetails
): Promise<LoginResponse> => {
	try {
		const response = await client.post<LoginResponse>('/user/google', {
			code,
			device,
		});
		return response.data;
	} catch (error) {
		return errorHandler(error);
	}
};

const register = async (
	email: string,
	password: string,
	name: string
): Promise<RegisterResponse> => {
	try {
		const response = await client.post<RegisterResponse>('/user/register', {
			email,
			password,
			name,
		});
		return response.data;
	} catch (error) {
		return errorHandler(error);
	}
};

const resendVerificationEmail = async (
	email: string
): Promise<ResendVerificationResponse> => {
	try {
		const response = await client.post<ResendVerificationResponse>(
			'/user/resend',
			{ email }
		);
		return response.data;
	} catch (error) {
		return errorHandler(error);
	}
};

const verifyEmail = async (token: string): Promise<{ success: boolean }> => {
	try {
		const response = await client.get<{
			success: boolean;
			message: string;
		}>(`/user/verify/${token}`);
		return response.data;
	} catch (error) {
		return errorHandler(error);
	}
};

export { login, googleLogin, register, resendVerificationEmail, verifyEmail };
