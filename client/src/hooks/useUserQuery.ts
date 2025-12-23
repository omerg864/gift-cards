import { ROUTES } from '@shared/constants/routes';
import { Card } from '@shared/types/card.types';
import { User } from '@shared/types/user.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generatePath } from '../lib/utils';
import { axiosErrorHandler, client } from '../services/client';
import { CARD_QUERY_KEY } from './useCardQuery';

export const USER_QUERY_KEY = 'user';
export const PROFILE_QUERY_KEY = 'profile';
export const DEVICES_QUERY_KEY = 'devices';

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: async () => {
      try {
        const response = await client.get<User>(
          generatePath({ route: [ROUTES.USER.BASE, '/:id'], params: { id } })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      try {
        const response = await client.patch<User>(
          generatePath({ route: [ROUTES.USER.BASE, ROUTES.USER.UPDATE], params: { id } }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, data?.id] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      try {
        const response = await client.patch(
          generatePath({ route: [ROUTES.USER.BASE, '/:id'], params: { id } }),
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, data?.id] });
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(
          generatePath({ route: [ROUTES.USER.BASE, ROUTES.USER.DELETE], params: { id } })
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useGetDevices = () => {
  return useQuery({
    queryKey: [DEVICES_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await client.get(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.USER.GET_DEVICES] })
        );
        return response.data.devices;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useDisconnectDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      try {
        // Server route: DELETE /api/auth/devices/:id
        await client.delete(
           `/api/auth/devices/${deviceId}`
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEVICES_QUERY_KEY] });
    },
  });
};

export const useDisconnectAllDevices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await client.delete(
          generatePath({ route: [ROUTES.AUTH.BASE, ROUTES.USER.DISCONNECT_ALL_DEVICES] })
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEVICES_QUERY_KEY] });
    },
  });
};

export const useSetEncryptionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salt, verifyToken }: { salt: string; verifyToken: string }) => {
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.USER.BASE, ROUTES.USER.CREATE_ENCRYPTION_KEY] }),
          {
            salt,
            verifyToken,
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
    },
  });
};

export const useUpdateEncryptionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salt, verifyToken, cards }: { salt: string; verifyToken: string; cards: Card[] }) => {
      try {
        const response = await client.patch(
          generatePath({ route: [ROUTES.USER.BASE, ROUTES.USER.CHANGE_ENCRYPTION_KEY] }),
          {
            salt,
            verifyToken,
            cards,
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useResetEncryptionKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salt, verifyToken }: { salt: string; verifyToken: string }) => {
      try {
        const response = await client.patch(
          generatePath({ route: [ROUTES.USER.BASE, ROUTES.USER.RESET_ENCRYPTION_KEY] }),
          {
            salt,
            verifyToken,
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useUpdateUserPassword = () => {
  return useMutation({
    mutationFn: async (password: string) => {
      try {
        // Server route: POST /api/auth/change-password
        const response = await client.post(
          '/api/auth/change-password',
          { password }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};
