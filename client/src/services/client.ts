import { ROUTES } from '@shared/constants/routes';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore as authStore } from '../stores/useAuthStore';
import { createIdbAsyncStorage, idbStore } from './api-cache';

const NO_RETRY_STATUS_CODES = [422, 429, 401];

interface GenerateLinkParams {
	baseUrl?: string;
	route: string[];
	params?: Record<string, string>;
}

export function generateLink({
	baseUrl = '',
	route,
	params,
}: GenerateLinkParams): string {
	let path = route.join('');

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			path = path.replace(`:${key}`, value);
		});
	}

	// remove double slashes
	path = path.replace(/([^:]\/)\/+/g, '$1');

	return `${baseUrl}${path}`;
}

function retryFunction(failureCount: number, error: unknown): boolean {
	if (!navigator.onLine) {
		return false;
	}
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		// Don't retry if 422, 429, or 401
		if (NO_RETRY_STATUS_CODES.includes(status ?? 0)) return false;
	}
	// Retry up to 2 times for other errors
	return failureCount < 2;
}

function handleGlobalError(error: unknown) {
	const typedError = error as AxiosError<Error>;
	if (axios.isAxiosError(typedError) && typedError.response?.status === 401) {
		const url = typedError.config?.url;
		// Don't trigger for login or refresh endpoints to avoid loops
		if (
			url?.includes(ROUTES.AUTH.LOGIN) ||
			url?.includes(ROUTES.AUTH.REFRESH)
		) {
			return;
		}
		authStore.getState().removeAuthenticated();
		queryClient.clear();
		toast.error('Session expired');
		return;
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: retryFunction,
			retryDelay: 1000,
			staleTime: 5 * 60 * 1000, // data fresh for 5 minutes
			throwOnError: (error, query) => {
				if (query.state.status === 'error') {
					handleGlobalError(error);
				}
				return false;
			},
		},
		mutations: {
			retry: retryFunction,
			retryDelay: 1000,
			onError: (error: unknown) => {
				handleGlobalError(error);
			},
		},
	},
});

export const asyncStoragePersister = createAsyncStoragePersister({
	storage: createIdbAsyncStorage(idbStore),
	serialize: (data) => JSON.stringify(data),
	deserialize: (data) => JSON.parse(data),
});

export const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '',
	timeout: 10_000,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// Flag to track token refreshing
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

// Response interceptor → catch 401 errors
axiosClient.interceptors.response.use(
	async (response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			if (!isRefreshing) {
				isRefreshing = true;

				try {
					const refreshUrl = generateLink({
						baseUrl: import.meta.env.VITE_API_BASE_URL || '',
						route: [ROUTES.AUTH.BASE, ROUTES.AUTH.REFRESH],
					});

					// await the post request to refresh the cookie
					await axios.post(refreshUrl, {}, { withCredentials: true });

					// Retry any queued requests
					refreshQueue.forEach((callback) => callback());
					refreshQueue = [];

					// Retry the original request
					return axiosClient(originalRequest);
				} catch {
					refreshQueue = [];
					isRefreshing = false;
					isRefreshing = false;
					authStore.getState().removeAuthenticated();
					queryClient.clear();
					toast.error('Session expired');
					return Promise.reject(error);
				} finally {
					isRefreshing = false;
				}
			} else {
				// Queue this request until the refresh finishes
				return new Promise((resolve, reject) => {
					refreshQueue.push(async () => {
						// Check if we are still authenticated via store instead of token
						if (!authStore.getState().isAuthenticated) {
							reject(error);
							return;
						}
						try {
							const result = await axiosClient(originalRequest);
							resolve(result);
						} catch (err) {
							reject(err);
						}
					});
				});
			}
		}

		return Promise.reject(error);
	}
);
