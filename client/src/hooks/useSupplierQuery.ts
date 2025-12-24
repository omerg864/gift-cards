import { ROUTES } from '@shared/constants/routes';
import { CreateSupplierDto, Supplier, UpdateSupplierDto } from '@shared/types/supplier.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { generatePath } from '../lib/utils';
import { axiosErrorHandler, client } from '../services/client';
import { useAuth } from './useAuth';

export const SUPPLIER_QUERY_KEY = 'supplier'

export const useGetSuppliers = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [SUPPLIER_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await client.get<Supplier[]>(
          generatePath({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.GET_ALL] })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    enabled: accessToken,
  });

  useEffect(() => {
    if (query.data) {
      query.data.forEach((supplier) => {
        queryClient.setQueryData([SUPPLIER_QUERY_KEY, supplier.id], supplier);
      });
    }
  }, [query.data, queryClient]);

  return query;
};

export const useGetSupplier = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [SUPPLIER_QUERY_KEY, id],
    queryFn: async () => {
      try {
        const response = await client.get<Supplier>(
          generatePath({ route: [ROUTES.SUPPLIER.BASE, '/:id'], params: { id } })
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    enabled: options?.enabled !== false && !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
		mutationFn: async (data: CreateSupplierDto & { supplierLogo?: File; storesImages?: File[], logo?: File | null }) => {
			const formData = new FormData();
			// append normal fields
			Object.keys(data).forEach(key => {
				if (key === 'stores' || key === 'cardTypes') {
					formData.append(key, JSON.stringify(data[key]));
				} else if (key !== 'supplierLogo' && key !== 'storesImages' && key !== 'logo') {
					formData.append(key, (data as any)[key]);
				}
			});
			// append files
			if (data.supplierLogo) {
				formData.append('supplier', data.supplierLogo);
			}
			if (data.logo) {
				formData.append('supplier', data.logo);
			}
      if (data.storesImages && data.storesImages.length > 0) {
        data.storesImages.forEach(file => {
          formData.append('stores_images', file);
        });
      }

      try {
        const response = await client.post<Supplier>(
          generatePath({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.CREATE] }),
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierDto & { supplierLogo?: File; storesImages?: File[] } }) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'stores' || key === 'cardTypes') {
           formData.append(key, JSON.stringify(data[key]));
        } else if (key !== 'supplierLogo' && key !== 'storesImages') {
           formData.append(key, (data as any)[key]);
        }
      });
      if (data.supplierLogo) {
        formData.append('supplier', data.supplierLogo);
      }
      if (data.storesImages && data.storesImages.length > 0) {
        data.storesImages.forEach(file => {
          formData.append('stores_images', file);
        });
      }

      try {
        const response = await client.patch<Supplier>(
          generatePath({ route: [ROUTES.SUPPLIER.BASE, '/:id'], params: { id } }),
          formData,
           { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY, data?.id] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await client.delete(
          generatePath({ route: [ROUTES.SUPPLIER.BASE, '/:id'], params: { id } })
        );
      } catch (error) {
        axiosErrorHandler(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};
