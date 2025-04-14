'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ACCESS_TOKEN,
	AUTH_EXPIRATION,
	REFRESH_TOKEN,
	USER,
} from '../lib/constants';

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	isVerified?: boolean;
}

interface AuthContextType {
	setUser: (user: User | null) => void;
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	register: (
		name: string,
		email: string,
		password: string
	) => Promise<boolean>;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
	isLoading: boolean;
	resetPassword: (email: string) => Promise<boolean>;
	verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user from localStorage on mount
	useEffect(() => {
		const storedUser = localStorage.getItem(USER);
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				localStorage.removeItem(USER);
				console.error('Failed to parse stored user:', error);
			}
		}
		setIsLoading(false);
	}, []);

	// Save user to localStorage when it changes
	useEffect(() => {
		if (user) {
			localStorage.setItem(USER, JSON.stringify(user));
		} else {
			localStorage.removeItem(ACCESS_TOKEN);
			localStorage.removeItem(REFRESH_TOKEN);
			localStorage.removeItem(AUTH_EXPIRATION);
			localStorage.removeItem(USER);
		}
	}, [user]);

	const login = async (email: string, password: string): Promise<boolean> => {
		// In a real app, this would be an API call
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock login logic - in a real app, this would validate credentials with a backend
		if (email && password) {
			// For demo purposes, any non-empty email/password works
			setUser({
				id: '1',
				name: email.split('@')[0],
				email,
				avatar: '',
				isVerified: true,
			});
			setIsLoading(false);
			return true;
		}

		setIsLoading(false);
		return false;
	};

	const register = async (
		name: string,
		email: string,
		password: string
	): Promise<boolean> => {
		// In a real app, this would be an API call
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock registration logic
		if (name && email && password) {
			// In a real app, we would not set the user here, but redirect to verification
			setUser({
				id: '1',
				name,
				email,
				avatar: '',
				isVerified: false,
			});
			setIsLoading(false);

			// Redirect to verify email page
			navigate('/verify-email');
			return true;
		}

		setIsLoading(false);
		return false;
	};

	const logout = () => {
		setUser(null);
	};

	const updateUser = (userData: Partial<User>) => {
		if (user) {
			setUser({ ...user, ...userData });
		}
	};

	const resetPassword = async (email: string): Promise<boolean> => {
		// In a real app, this would be an API call
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsLoading(false);
		return true;
	};

	const verifyEmail = async (token: string): Promise<boolean> => {
		// In a real app, this would be an API call
		setIsLoading(true);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (user) {
			setUser({ ...user, isVerified: true });
		}

		setIsLoading(false);
		return true;
	};

	return (
		<AuthContext.Provider
			value={{
				setUser,
				user,
				login,
				register,
				logout,
				updateUser,
				isLoading,
				resetPassword,
				verifyEmail,
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
