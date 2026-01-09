import { ROUTES } from '@shared/constants/routes';
import { Settings } from '@shared/types/settings.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient, generateLink } from '../services/client';

export const SETTINGS_QUERY_KEY = 'settings';

export const useGetSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: async () => {
        const response = await axiosClient.get<Settings>(
          generateLink({ route: [ROUTES.SETTINGS.BASE, ROUTES.SETTINGS.GET_ALL] })
        );
        return response.data;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Settings>) => {
        const response = await axiosClient.put<Settings>(
          generateLink({ route: [ROUTES.SETTINGS.BASE, ROUTES.SETTINGS.UPDATE] }),
          data
        );
        return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
};

