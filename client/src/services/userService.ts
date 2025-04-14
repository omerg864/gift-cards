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

const googleLogin = async (code: string, device: DeviceDetails): Promise<LoginResponse> => {
    try {
        const response = await client.post<LoginResponse>('/user/google', {
            code,
            device,
        });
        return response.data;
    } catch (error) {
        return errorHandler(error);
    }
}

export { login, googleLogin };
