import { createStore, del, get, set, type UseStore } from 'idb-keyval';

export interface AsyncStorage {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
}

export function createIdbAsyncStorage(store: UseStore): AsyncStorage {
	return {
		getItem: async (key) => {
			const result = await get(key, store);
			return result ?? null;
		},
		setItem: async (key, value) => {
			await set(key, value, store);
		},
		removeItem: async (key) => {
			await del(key, store);
		},
	};
}

export const idbStore = createStore('my-db', 'my-store');
