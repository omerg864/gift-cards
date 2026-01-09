import { ROUTES } from '@shared/constants/routes';
import { Card, CreateCardDto, UpdateCardDto } from '@shared/types/card.types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient, generateLink, queryClient } from '../services/client';
import { SUPPLIER_QUERY_KEY } from './useSupplierQuery';


export const CARD_QUERY_KEY = 'card'

export const useGetCards = () => {
  const query = useQuery({
    queryKey: [CARD_QUERY_KEY],
    queryFn: async () => {
        const response = await axiosClient.get<Card[]>(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.GET_ALL] })
        );
        const cards = response.data;
        cards.forEach((card) => {
          queryClient.setQueryData([CARD_QUERY_KEY, card.id], card);
        });
        return cards;
    },
  });

  return query;
};

export const useGetCard = (id: string) => {
  return useQuery({
    queryKey: [CARD_QUERY_KEY, id],
    queryFn: async () => {
        const response = await axiosClient.get<Card>(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.GET_ONE], params: { id } })
        );
        return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCard = () => {
  return useMutation({
    mutationFn: async (data: CreateCardDto) => {
        const response = await axiosClient.post<Card>(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.CREATE] }),
          data
        );
        return response.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useUpdateCard = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCardDto }) => {
        const response = await axiosClient.patch<Card>(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.UPDATE], params: { id } }),
          data
        );
        return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY, data?.id] });
    },
  });
};

export const useDeleteCard = () => {
  return useMutation({
    mutationFn: async (id: string) => {
        await axiosClient.delete(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.DELETE], params: { id } })
        );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY] });
    },
  });
};

export const useCreateCardAndSupplier = () => {
  return useMutation({
    mutationFn: async (data: CreateCardDto & { supplierLogo?: File }) => {
      const formData = new FormData();
      if (data.card) formData.append('card', JSON.stringify(data.card));
      if (data.supplier) formData.append('supplier', JSON.stringify(data.supplier));
      if (data.supplierLogo) {
        formData.append('supplier', data.supplierLogo);
      }
      
        const response = await axiosClient.post(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.CREATE] }),
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        return response.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};

export const useUpdateCardWithNewSupplier = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCardDto & { supplierLogo?: File } }) => {
      const formData = new FormData();
      if (data.card) formData.append('card', JSON.stringify(data.card));
      if (data.supplier) formData.append('supplier', JSON.stringify(data.supplier));
      if (data.supplierLogo) {
        formData.append('supplier', data.supplierLogo);
      }

        const response = await axiosClient.patch<Card>(
          generateLink({ route: [ROUTES.CARD.BASE, ROUTES.CARD.UPDATE], params: { id } }),
          formData,
          {
             headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [CARD_QUERY_KEY, data?.id] });
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};

