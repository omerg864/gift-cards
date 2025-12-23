'use client';

import { ROUTES } from '@shared/constants/routes';
import { User } from '@shared/types/user.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';
import {
	EMAIL,
	USER
} from '../lib/constants';
import { client } from '../services/client';

interface AuthContextType {
	setUser: (user: User | null) => void;
	setEmail: (email: string | null) => void;
	email: string | null;
	user: User | null;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
	isAuthenticated: boolean;
	handleAuthentication: (isAuthenticated: boolean) => void;
	accessToken: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		() => localStorage.getItem('isAuthenticated') === 'true'
	);
	const [accessToken, setAccessToken] = useState<boolean>(false);
	const queryClient = useQueryClient();

	const { data: profile, isError, isFetching } = useQuery({
		queryKey: ['profile'],
		queryFn: async () => {
				const response = await client.get<User>(`${ROUTES.USER.BASE}${ROUTES.USER.PROFILE}`);
				return response.data;
		},
		enabled: isAuthenticated,
		retry: false,
	});

	const logout = useCallback(() => {
		localStorage.setItem('isAuthenticated', 'false');
		setIsAuthenticated(false);
		setUser(null);
		setEmail(null);
		localStorage.removeItem(USER);
		localStorage.removeItem(EMAIL);
		queryClient.clear();
	}, [queryClient]);

	useEffect(() => {
		if (profile) {
			// Only update if profile is different from current user
			// This prevents infinite loops from unnecessary state updates
			if (JSON.stringify(profile) !== JSON.stringify(user)) {
				setUser(profile);
				setAccessToken(true);
			}
		} else if (isError && isAuthenticated && !isFetching) {
			// Only logout if we're authenticated and get an error
			// This prevents infinite loops
			logout();
		}
	}, [profile, isError, isAuthenticated, logout, user, isFetching]);

	// Load user from localStorage on mount
	useEffect(() => {
		const storedUser = localStorage.getItem(USER);
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				logout();
				console.error('Failed to parse stored user:', error);
			}
		}
		const storedEmail = localStorage.getItem(EMAIL);
		if (storedEmail) {
			setEmail(storedEmail);
		}
	}, []);

	// Save user to localStorage when it changes
	useEffect(() => {
		if (user) {
			localStorage.setItem(USER, JSON.stringify(user));
		} else {
			localStorage.removeItem(USER);
		}
	}, [user]);

	useEffect(() => {
		if (email) {
			localStorage.setItem(EMAIL, email);
		} else {
			localStorage.removeItem(EMAIL);
		}
	}, [email]);



	const handleAuthentication = (isAuthenticated: boolean) => {
		setIsAuthenticated(isAuthenticated);
		localStorage.setItem('isAuthenticated', String(isAuthenticated));
	};

	const updateUser = (userData: Partial<User>) => {
		if (user) {
			setUser({ ...user, ...userData });
		}
	};

	return (
		<AuthContext.Provider
			value={{
				accessToken,
				setUser,
				user,
				setEmail,
				email,
				logout,
				updateUser,
				isAuthenticated,
				handleAuthentication,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
