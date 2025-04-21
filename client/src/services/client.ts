import axios from 'axios';
import { ACCESS_TOKEN, AUTH_EXPIRATION, REFRESH_TOKEN } from '../lib/constants';

const URL = import.meta.env.VITE_API_URL;

const client = axios.create({
	baseURL: URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

const refreshToken = async (refreshToken: string | undefined) => {
	try {
		const res = await client.post<{
			success: boolean;
			accessToken: string;
			refreshToken: string;
		}>('user/refresh', {
			refreshToken,
		});
		localStorage.setItem(ACCESS_TOKEN, res.data.accessToken);
		localStorage.setItem(REFRESH_TOKEN, res.data.refreshToken);
		const expiration = new Date();
		expiration.setMinutes(expiration.getMinutes() + 50);
		localStorage.setItem(AUTH_EXPIRATION, expiration.toISOString());
		return res.data.accessToken;
	} catch (error) {
		console.error('Token refresh failed: ', error);
		return null;
	}
};

const checkToken = async (): Promise<string | null> => {
	let token = localStorage.getItem(ACCESS_TOKEN);
	const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN);
	const expiration = localStorage.getItem(AUTH_EXPIRATION);
	if (!token) {
		if (!storedRefreshToken) {
			return null;
		}
		token = await refreshToken(storedRefreshToken);
		if (!token) {
			return null;
		}
	}

	if (expiration && new Date(expiration) < new Date()) {
		if (!storedRefreshToken) {
			return null;
		}
		console.log('Token expired. Refreshing token...');
		token = await refreshToken(storedRefreshToken);
	}
	if (!token) {
		return null;
	}
	return token;
};

const axiosErrorHandler = (error: unknown): never => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message || 'Login failed';
		throw new Error(message);
	} else {
		if ((error as Error).message === 'Network Error') {
			throw new Error('Network error. Please check your connection.');
		} else if ((error as Error).message === 'Please login') {
			throw new Error('Please login');
		}
		throw new Error('Internal server error');
	}
};

export { client, refreshToken, checkToken, axiosErrorHandler };
