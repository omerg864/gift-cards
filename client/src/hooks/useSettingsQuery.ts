import { ROUTES } from '@shared/constants/routes';
import { Settings } from '@shared/types/settings.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generatePath } from '../lib/utils';
import { axiosErrorHandler, client } from '../services/client';

export const SETTINGS_QUERY_KEY = 'settings';

export const useGetSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await client.get<Settings>(
          generatePath({ route: [ROUTES.SETTINGS.BASE, ROUTES.SETTINGS.GET_ALL] })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      try {
        const response = await client.put<Settings>(
          generatePath({ route: [ROUTES.SETTINGS.BASE, ROUTES.SETTINGS.UPDATE] }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
};
