import { ROUTES } from '@shared/constants/routes';
import { Card } from '@shared/types/card.types';
import { User } from '@shared/types/user.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient, generateLink } from '../services/client';
import { CARD_QUERY_KEY } from './useCardQuery';

export const USER_QUERY_KEY = 'user';
export const PROFILE_QUERY_KEY = 'profile';
export const DEVICES_QUERY_KEY = 'devices';

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: async () => {
        const response = await axiosClient.get<User>(
          generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.GET_ONE], params: { id } })
        );
        return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await axiosClient.patch<User>(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.UPDATE], params: { id } }),
        data
      );
      return response.data;
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
      const response = await axiosClient.patch(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.UPDATE], params: { id } }),
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
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
      await axiosClient.delete(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.DELETE], params: { id } })
      );
    },
  });
};

export const useGetDevices = () => {
  return useQuery({
    queryKey: [DEVICES_QUERY_KEY],
    queryFn: async () => {
      const response = await axiosClient.get(
        generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.USER.GET_DEVICES] })
      );
      return response.data.devices;
    },
  });
};

export const useDisconnectDevice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      // Server route: DELETE /api/auth/devices/:id
      // Note: This route is in AUTH base, but follows similar pattern. 
      // Assuming ROUTES structure. If not present in ROUTES, constructing manually but using generateLink if possible or direct string if not in routes 
      // The previous code had: /api/auth/devices/${deviceId}
      // ROUTES has DISCONNECT_DEVICE: '/disconnect-device/:id' under USER.. wait, let me check ROUTES again.
      // ROUTES.USER.DISCONNECT_DEVICE is '/disconnect-device/:id'
      // But the previous code used /api/auth/devices/${deviceId}. 
      // Let's check ROUTES.AUTH... check previous file content.
      await axiosClient.delete(
         `/api/auth/devices/${deviceId}`
      );
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
      await axiosClient.delete(
        generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.USER.DISCONNECT_ALL_DEVICES] })
      );
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
      const response = await axiosClient.post(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.CREATE_ENCRYPTION_KEY] }),
        {
          salt,
          verifyToken,
        }
      );
      return response.data;
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
      const response = await axiosClient.patch(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.CHANGE_ENCRYPTION_KEY] }),
        {
          salt,
          verifyToken,
          cards,
        }
      );
      return response.data;
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
      const response = await axiosClient.patch(
        generateLink({ route: [ROUTES.USER.BASE, ROUTES.USER.RESET_ENCRYPTION_KEY] }),
        {
          salt,
          verifyToken,
        }
      );
      return response.data;
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
      // Server route: POST /api/auth/change-password
      const response = await axiosClient.post(
        generateLink({ route: [ROUTES.AUTH.BASE, ROUTES.USER.CHANGE_PASSWORD] }),
        { password }
      );
      return response.data;
    },
  });
};

