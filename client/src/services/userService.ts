import { GiftCard } from '../types/gift-card';
import { Device, DeviceDetails, User } from '../types/user';
import { CardsResponse } from './cardService';
import { axiosErrorHandler, checkToken, client } from './client';

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
	success: boolean;
}

export interface RegisterResponse {
	sent: boolean;
	message: string;
	success: boolean;
}

export interface EmailRequestResponse {
	sent: boolean;
	success: boolean;
}

export interface MessageResponse {
	message: string;
	success: boolean;
}

export interface DevicesResponse {
	devices: Device[];
	success: boolean;
}

export interface UserResponse {
	user: User;
	success: boolean;
}

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
		return axiosErrorHandler(error);
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
		return axiosErrorHandler(error);
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
		return axiosErrorHandler(error);
	}
};

const resendVerificationEmail = async (
	email: string
): Promise<EmailRequestResponse> => {
	try {
		const response = await client.post<EmailRequestResponse>(
			'/user/resend',
			{ email }
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
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
		return axiosErrorHandler(error);
	}
};

const forgotPassword = async (email: string): Promise<EmailRequestResponse> => {
	try {
		const response = await client.post<EmailRequestResponse>(
			'user/forgot/email',
			{
				email,
			}
		);

		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const resetPassword = async (
	token: string,
	email: string,
	password: string
) => {
	try {
		const response = await client.post<MessageResponse>(
			`user/forgot/password/${email}`,
			{
				token,
				password,
			}
		);

		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const setEncryptionKey = async (salt: string, verifyToken: string) => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.post<MessageResponse>(
			'user/encryption',
			{
				salt,
				verifyToken,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const updateUser = async (
	name: string,
	deleteImage: boolean,
	file: File | null
) => {
	const formData = new FormData();
	formData.append('name', name);
	if (deleteImage) {
		formData.append('deleteImage', 'true');
	}
	if (file) {
		formData.append('image', file);
	}
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.put<UserResponse>(
			`user/update`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const updateUserPassword = async (password: string) => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.put<MessageResponse>(
			`user/password`,
			{ password },
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const updateEncryptionKey = async (
	salt: string,
	verifyToken: string,
	cards: Partial<GiftCard>[]
) => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.put<CardsResponse>(
			'user/encryption',
			{
				salt,
				verifyToken,
				cards,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const resetEncryptionKey = async (
	salt: string,
	verifyToken: string,
	cards: Partial<GiftCard>[]
) => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.put<CardsResponse>(
			'user/encryption/reset',
			{
				salt,
				verifyToken,
				cards,
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const getConnectedDevices = async () => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<DevicesResponse>('user/devices', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data.devices;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const disconnectDevice = async (id: string) => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<MessageResponse>(
			`user/disconnect/${id}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const disconnectAllDevices = async () => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<MessageResponse>('user/disconnect', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

export {
	login,
	googleLogin,
	register,
	resendVerificationEmail,
	verifyEmail,
	forgotPassword,
	resetPassword,
	setEncryptionKey,
	updateUser,
	updateUserPassword,
	updateEncryptionKey,
	resetEncryptionKey,
	getConnectedDevices,
	disconnectDevice,
	disconnectAllDevices,
};
