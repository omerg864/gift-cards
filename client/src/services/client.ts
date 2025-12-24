import { ROUTES } from '@shared/constants/routes';
import axios from 'axios';

const URL = import.meta.env.VITE_API_URL;

const client = axios.create({
	baseURL: URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

client.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				await client.post(
					`${URL}${ROUTES.AUTH.BASE}${ROUTES.AUTH.REFRESH}`,
					{},
					{ withCredentials: true }
				);

				return client(originalRequest);
			} catch (refreshError) {
				localStorage.setItem('isAuthenticated', 'false');
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

const axiosErrorHandler = (error: unknown): never => {
	if (axios.isAxiosError(error)) {
		const message = error.response?.data?.message || 'Request failed';
		throw new Error(message);
	} else {
		if ((error as Error).message === 'Network Error') {
			throw new Error('Network error. Please check your connection.');
		}
		throw new Error('Internal server error');
	}
};

export { axiosErrorHandler, client };

