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
import { User } from '../types/user';

interface AuthContextType {
	setUser: (user: User | null) => void;
	setEmail: (email: string | null) => void;
	email: string | null;
	user: User | null;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
	isAuthenticated: boolean;
	handleAuthentication: (isAuthenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		() => localStorage.getItem('isAuthenticated') === 'true'
	);

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

	const logout = () => {
		localStorage.setItem('isAuthenticated', 'false');
		setIsAuthenticated(false);
		setUser(null);
		setEmail(null);
		localStorage.removeItem(USER);
		localStorage.removeItem(ACCESS_TOKEN);
		localStorage.removeItem(REFRESH_TOKEN);
		localStorage.removeItem(AUTH_EXPIRATION);
		localStorage.removeItem(EMAIL);
	};

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
