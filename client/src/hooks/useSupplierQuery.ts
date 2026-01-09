import { ROUTES } from '@shared/constants/routes';
import { CreateSupplierDto, Supplier, UpdateSupplierDto } from '@shared/types/supplier.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient, generateLink } from '../services/client';

export const SUPPLIER_QUERY_KEY = 'supplier'

export const useGetSuppliers = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [SUPPLIER_QUERY_KEY],
    queryFn: async () => {
        const response = await axiosClient.get<Supplier[]>(
          generateLink({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.GET_ALL] })
        );
        const suppliers = response.data;
        suppliers.forEach((supplier) => {
          queryClient.setQueryData([SUPPLIER_QUERY_KEY, supplier.id], supplier);
        });
        return suppliers;
    },
  });

  return query;
};

export const useGetSupplier = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [SUPPLIER_QUERY_KEY, id],
    queryFn: async () => {
        const response = await axiosClient.get<Supplier>(
          generateLink({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.GET_ONE], params: { id } })
        );
        return response.data;
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
					formData.append(key, JSON.stringify(data[key as keyof typeof data]));
				} else if (key !== 'supplierLogo' && key !== 'storesImages' && key !== 'logo') {
					formData.append(key, data[key as keyof typeof data] as string);
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

        const response = await axiosClient.post<Supplier>(
          generateLink({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.CREATE] }),
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
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
           formData.append(key, data[key as keyof typeof data] as string | Blob);
        } else if (key !== 'supplierLogo' && key !== 'storesImages') {
           formData.append(key, data[key as keyof typeof data] as string);
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

        const response = await axiosClient.patch<Supplier>(
          generateLink({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.UPDATE], params: { id } }),
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY, data?.id] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
        await axiosClient.delete(
          generateLink({ route: [ROUTES.SUPPLIER.BASE, ROUTES.SUPPLIER.DELETE], params: { id } })
        );
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
    },
  });
};

