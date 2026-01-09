import { create } from 'zustand';
import { User } from '../../../shared/types/user.types';
import {
	EMAIL_STORAGE_KEY,
	IS_AUTHENTICATED_STORAGE_KEY,
	USER_STORAGE_KEY,
} from '../constants/auth.constants';

type AuthState = {
	isAuthenticated: boolean;
	user: User | null;
	email: string | null;
	setAuthenticated: (user: User) => void;
	updateUser: (user: Partial<User>) => void;
	removeAuthenticated: () => void;
	setEmail: (email: string | null) => void;
};

const getUserFromStorage = () => {
	if (localStorage.getItem(USER_STORAGE_KEY)) {
		try {
			const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
			return user;
		} catch (error) {
			console.error('Error parsing user from storage:', error);
			return null;
		}
	}
	return null;
};

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated:
		localStorage.getItem(IS_AUTHENTICATED_STORAGE_KEY) === 'true',
	user: getUserFromStorage(),
	email: localStorage.getItem(EMAIL_STORAGE_KEY),
	setAuthenticated: (user: User) => {
		localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
		localStorage.setItem(IS_AUTHENTICATED_STORAGE_KEY, 'true');
		set({
			isAuthenticated: true,
			user,
		});
	},
	removeAuthenticated: () => {
		localStorage.removeItem(USER_STORAGE_KEY);
		localStorage.removeItem(EMAIL_STORAGE_KEY);
		localStorage.setItem(IS_AUTHENTICATED_STORAGE_KEY, 'false');
		set({
			isAuthenticated: false,
			user: null,
			email: null,
		});
	},
	updateUser: (user: Partial<User>) => {
		const newUser = {
			...useAuthStore.getState().user,
			...user,
		} as User;
		localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
		set(() => ({
			user: newUser,
		}));
	},
	setEmail: (email: string | null) => {
		if (email) {
			localStorage.setItem(EMAIL_STORAGE_KEY, email);
		} else {
			localStorage.removeItem(EMAIL_STORAGE_KEY);
		}
		set({ email });
	},
}));
