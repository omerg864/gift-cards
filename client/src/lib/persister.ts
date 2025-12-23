import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { del, get, set } from 'idb-keyval';

export const createIDBPersister = (idbValidKey: IDBValidKey = 'reactQuery'): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
};

export const persister = createIDBPersister();
