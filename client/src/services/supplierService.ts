import { Supplier } from '../types/supplier';
import { client, checkToken, axiosErrorHandler } from './client';

export interface SuppliersResponse {
	suppliers: Supplier[];
	success: boolean;
}

const getSuppliers = async (): Promise<SuppliersResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<SuppliersResponse>('/supplier', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

export { getSuppliers };
