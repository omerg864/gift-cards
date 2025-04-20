import { Supplier } from './supplier';

export interface GiftCard {
	_id: string;
	user: string;
	name: string;
	supplier: Supplier | string;
	description?: string;
	isPhysical: boolean;
	amount: number;
	currency: string;
	cardNumber?: string;
	expirationMonth?: number;
	expirationYear?: number;
	cvv?: string;
	encryptedCardNumber?: string;
}

export interface CreateGiftCardDetails extends Omit<GiftCard, '_id' | 'user'> {
	supplierName: string;
	supplierImage: File | null;
	supportedStores: string[];
	stores_images: File[];
	supplierId: string;
	expirationDate: string;
	encryptionKey: string;
	expiry?: Date;
	last4?: string;
}

// Currency options
export const currencies = [
	{ code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
	{ code: 'USD', symbol: '$', name: 'US Dollar' },
	{ code: 'EUR', symbol: '€', name: 'Euro' },
	{ code: 'GBP', symbol: '£', name: 'British Pound' },
	{ code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
	{ code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
	{ code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Get currency symbol by code
export const getCurrencySymbol = (code: string): string => {
	const currency = currencies.find((c) => c.code === code);
	return currency ? currency.symbol : code;
};
