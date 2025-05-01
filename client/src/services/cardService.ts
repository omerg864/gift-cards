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
	stores_images: File[],
	formColor: string,
	toColor: string,
	cardNumber?: string,
	last4?: string,
	expiry?: string,
	cvv?: string
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
		formData.append('fromColor', formColor);
		formData.append('toColor', toColor);
		if (supplierImage) {
			formData.append('supplierImage', supplierImage);
		}
		stores_images.forEach((image) => {
			formData.append('stores_images', image);
		});
		if (cardNumber) {
			formData.append('cardNumber', cardNumber);
		}
		if (last4) {
			formData.append('last4', last4);
		}
		if (expiry) {
			formData.append('expiry', new Date(expiry).toISOString());
		}
		if (cvv) {
			formData.append('cvv', cvv);
		}

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
	currency: string,
	cardNumber?: string,
	last4?: string,
	expiry?: string,
	cvv?: string
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
		if (cardNumber) {
			formData.append('cardNumber', cardNumber);
		}
		if (last4) {
			formData.append('last4', last4);
		}
		if (expiry) {
			formData.append('expiry', new Date(expiry).toISOString());
		}
		if (cvv) {
			formData.append('cvv', cvv);
		}

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
		console.error('Error creating card and supplier:', error);
		return axiosErrorHandler(error);
	}
};

const updateCardWithNewSupplier = async (
	id: string,
	name: string,
	supplierName: string,
	description: string,
	isPhysical: boolean,
	amount: number,
	currency: string,
	stores: Store[],
	supplierImage: File | null,
	stores_images: File[],
	formColor: string,
	toColor: string,
	cardNumber?: string,
	last4?: string,
	expiry?: string,
	cvv?: string
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
		formData.append('fromColor', formColor);
		formData.append('toColor', toColor);
		if (supplierImage) {
			formData.append('supplierImage', supplierImage);
		}
		stores_images.forEach((image) => {
			formData.append('stores_images', image);
		});

		if (cardNumber) {
			formData.append('cardNumber', cardNumber);
		}
		if (last4) {
			formData.append('last4', last4);
		}
		if (expiry) {
			formData.append('expiry', new Date(expiry).toISOString());
		}
		if (cvv) {
			formData.append('cvv', cvv);
		}

		const response = await client.put<CardSupplierResponse>(
			`/card/supplier/${id}`,
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

const updateCard = async (
	id: string,
	name: string,
	supplier: string,
	description: string,
	isPhysical: boolean,
	amount: number,
	currency: string,
	cardNumber?: string,
	last4?: string,
	expiry?: string,
	cvv?: string
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

		if (cardNumber) {
			formData.append('cardNumber', cardNumber);
		}
		if (last4) {
			formData.append('last4', last4);
		}
		if (expiry) {
			formData.append('expiry', new Date(expiry).toISOString());
		}
		if (cvv) {
			formData.append('cvv', cvv);
		}

		const response = await client.put<CardSupplierResponse>(
			`/card/${id}`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		console.error('Error updating card:', error);
		return axiosErrorHandler(error);
	}
};

const deleteCard = async (id: string): Promise<CardSupplierResponse> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.delete<CardSupplierResponse>(
			`/card/${id}`,
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
	getUserCards,
	createCardAndSupplier,
	createCard,
	updateCardWithNewSupplier,
	updateCard,
	deleteCard,
};
