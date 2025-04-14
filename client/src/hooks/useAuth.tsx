'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';
import {
	ACCESS_TOKEN,
	AUTH_EXPIRATION,
	EMAIL,
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
	setEmail: (email: string | null) => void;
	email: string | null;
	user: User | null;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
	isLoading: boolean;
	resetPassword: (email: string) => Promise<boolean>;
	verifyEmail: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState<string | null>(null);
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
			localStorage.removeItem(ACCESS_TOKEN);
			localStorage.removeItem(REFRESH_TOKEN);
			localStorage.removeItem(AUTH_EXPIRATION);
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

	const logout = () => {
		setUser(null);
		setEmail(null);
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
				setEmail,
				email,
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
