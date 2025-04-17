import { GiftCard } from '../types/gift-card';
import { Store, Supplier } from '../types/supplier';
import { client, checkToken, axiosErrorHandler } from './client';

export interface CardsResponse {
	cards: GiftCard[];
	success: boolean;
}

export interface CardSupplierResponse {
	card: GiftCard;
	supplier: Supplier;
	success: boolean;
}

const getUserCards = async (query: string): Promise<CardsResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<CardsResponse>('/card', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				query,
			},
		});

		return response.data;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

const createCardAndSupplier = async (
	name: string,
	supplierName: string,
	description: string,
	isPhysical: boolean,
	amount: number,
	currency: string,
	stores: Store[],
	supplierImage: File | null,
	stores_images: File[]
): Promise<CardSupplierResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const formData = new FormData();
		formData.append('name', name);
		formData.append('supplierName', supplierName);
		formData.append('description', description);
		formData.append('isPhysical', String(isPhysical));
		formData.append('amount', String(amount));
		formData.append('currency', currency);
		formData.append('stores', JSON.stringify(stores));
		if (supplierImage) {
			formData.append('supplierImage', supplierImage);
		}
		stores_images.forEach((image) => {
			formData.append('stores_images', image);
		});

		const response = await client.post<CardSupplierResponse>(
			'/card/supplier',
			formData,
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

const createCard = async (
	name: string,
	supplier: string,
	description: string,
	isPhysical: boolean,
	amount: number,
	currency: string
): Promise<CardSupplierResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const formData = new FormData();
		formData.append('name', name);
		formData.append('supplier', supplier);
		formData.append('description', description);
		formData.append('isPhysical', String(isPhysical));
		formData.append('amount', String(amount));
		formData.append('currency', currency);

		const response = await client.post<CardSupplierResponse>(
			'/card',
			formData,
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

const updateCardWithNewSupplier = async () => {};

const updateCard = async () => {};

export {
	getUserCards,
	createCardAndSupplier,
	createCard,
	updateCardWithNewSupplier,
	updateCard,
};
