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
		console.log('Token refresh failed: ', error);
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
		console.log('Refreshing token...');
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

export { client, refreshToken, checkToken };
