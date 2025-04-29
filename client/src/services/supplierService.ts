import { isNil } from 'lodash';
import { CreateSupplierDetails, Supplier } from '../types/supplier';
import { client, checkToken, axiosErrorHandler } from './client';
import { MessageResponse } from './userService';

export interface SuppliersResponse {
	suppliers: Supplier[];
	success: boolean;
}

export interface SupplierResponse {
	supplier: Supplier;
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

const createUserSupplier = async (
	data: CreateSupplierDetails
): Promise<SuppliersResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const formData = new FormData();
		formData.append('name', data.name);
		if (data.description) {
			formData.append('description', data.description);
		}
		formData.append('fromColor', data.fromColor);
		formData.append('toColor', data.toColor);
		formData.append('cardTypes', JSON.stringify(data.cardTypes));
		formData.append('stores', JSON.stringify(data.stores));
		if (data.logo) {
			formData.append('supplier', data.logo);
		}

		const response = await client.post<SuppliersResponse>(
			'/supplier',
			formData,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const updateUserSupplier = async (
	data: CreateSupplierDetails
): Promise<SupplierResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const formData = new FormData();
		formData.append('name', data.name);
		console.log('data', data);
		if (!isNil(data.description)) {
			formData.append('description', data.description);
		}
		if (data.deleteImage) {
			formData.append('deleteImageBool', 'true');
		}
		formData.append('fromColor', data.fromColor);
		formData.append('toColor', data.toColor);
		formData.append('cardTypes', JSON.stringify(data.cardTypes));
		formData.append('stores', JSON.stringify(data.stores));
		if (data.logo) {
			formData.append('supplier', data.logo);
		}

		const response = await client.put<SupplierResponse>(
			`/supplier/${data._id}`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const deleteUserSupplier = async (
	supplierId: string
): Promise<MessageResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.delete<MessageResponse>(
			`/supplier/${supplierId}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

export {
	getSuppliers,
	createUserSupplier,
	deleteUserSupplier,
	updateUserSupplier,
};
