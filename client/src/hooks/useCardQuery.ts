import { ROUTES } from '@shared/constants/routes';
import { Card, CreateCardDto, UpdateCardDto } from '@shared/types/card.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { generatePath } from '../lib/utils';
import { axiosErrorHandler, client } from '../services/client';
import { SUPPLIER_QUERY_KEY } from './useSupplierQuery';


export const CARD_QUERY_KEY = 'card'

export const useGetCards = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [CARD_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await client.get<Card[]>(
          generatePath({ route: [ROUTES.CARD.BASE, ROUTES.CARD.GET_ALL] })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
  });

  useEffect(() => {
    if (query.data) {
      query.data.forEach((card) => {
        queryClient.setQueryData([CARD_QUERY_KEY, card.id], card);
      });
    }
  }, [query.data, queryClient]);

  return query;
};

export const useGetCard = (id: string) => {
  return useQuery({
    queryKey: [CARD_QUERY_KEY, id],
    queryFn: async () => {
      try {
        const response = await client.get<Card>(
          generatePath({ route: [ROUTES.CARD.BASE, ROUTES.CARD.GET_ONE], params: { id } })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    enabled: !!id,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCardDto) => {
      try {
        const response = await client.post<Card>(
          generatePath({ route: [ROUTES.CARD.BASE, ROUTES.CARD.CREATE] }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCardDto }) => {
      try {
        const response = await client.patch<Card>(
          generatePath({ route: [ROUTES.CARD.BASE, '/:id'], params: { id } }),
          data
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY, data?.id] });
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(
          generatePath({ route: [ROUTES.CARD.BASE, '/:id'], params: { id } })
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useCreateCardAndSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCardDto & { supplierLogo?: File }) => {
      const formData = new FormData();
      if (data.card) formData.append('card', JSON.stringify(data.card));
      if (data.supplier) formData.append('supplier', JSON.stringify(data.supplier));
      if (data.supplierLogo) {
        formData.append('supplier', data.supplierLogo);
      }
      
      try {
        const response = await client.post(
          generatePath({ route: [ROUTES.CARD.BASE, ROUTES.CARD.CREATE] }),
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};

export const useUpdateCardWithNewSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCardDto & { supplierLogo?: File } }) => {
      const formData = new FormData();
      if (data.card) formData.append('card', JSON.stringify(data.card));
      if (data.supplier) formData.append('supplier', JSON.stringify(data.supplier));
      if (data.supplierLogo) {
        formData.append('supplier', data.supplierLogo);
      }

      try {
        const response = await client.patch(
          generatePath({ route: [ROUTES.CARD.BASE, '/:id'], params: { id } }),
          formData,
          {
             headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CARD_QUERY_KEY, data.card.id] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};
