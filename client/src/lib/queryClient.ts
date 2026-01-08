import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: true,
			refetchOnWindowFocus: false,
			gcTime: 1000 * 60 * 60 * 0.5, // 0.5 hours
		},
	},
});
