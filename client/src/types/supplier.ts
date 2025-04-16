export interface Supplier {
	_id: string;
	name: string;
	fromColor: string;
	toColor: string;
	logo?: string;
	stores: string[]; // Added supported stores to supplier
}

export interface Store {
	name: string;
	address?: string;
	image?: string;
}

export const predefinedSuppliers: Supplier[] = [
	{
		_id: 'amazon',
		name: 'Amazon',
		fromColor: '#1E3A8A', // Blue-700
		toColor: '#1E40AF', // Blue-900
		stores: [
			'Amazon',
			'Amazon Fresh',
			'Whole Foods',
			'Amazon Books',
			'Amazon Go',
		],
	},
	{
		_id: 'starbucks',
		name: 'Starbucks',
		fromColor: '#047857', // Green-600
		toColor: '#065F46', // Green-900
		stores: ['Starbucks', 'Starbucks Reserve', 'Teavana'],
	},
	{
		_id: 'target',
		name: 'Target',
		fromColor: '#DC2626', // Red-600
		toColor: '#991B1B', // Red-800
		stores: ['Target', 'Target Online', 'Shipt', 'Target Optical'],
	},
	{
		_id: 'walmart',
		name: 'Walmart',
		fromColor: '#2563EB', // Blue-500
		toColor: '#3730A3', // Indigo-700
		stores: [
			'Walmart',
			'Walmart.com',
			"Sam's Club",
			'Walmart Pharmacy',
			'Walmart Grocery',
		],
	},
	{
		_id: 'bestbuy',
		name: 'Best Buy',
		fromColor: '#F59E0B', // Yellow-500
		toColor: '#B45309', // Yellow-700
		stores: [
			'Best Buy',
			'Best Buy Online',
			'Best Buy Mobile',
			'Geek Squad',
		],
	},
	{
		_id: 'apple',
		name: 'Apple',
		fromColor: '#374151', // Gray-700
		toColor: '#1F2937', // Gray-900
		stores: [
			'Apple Store',
			'Apple Online',
			'App Store',
			'iTunes',
			'Apple Music',
		],
	},
	{
		_id: 'netflix',
		name: 'Netflix',
		fromColor: '#B91C1C', // Red-700
		toColor: '#7F1D1D', // Red-900
		stores: ['Netflix'],
	},
	{
		_id: 'spotify',
		name: 'Spotify',
		fromColor: '#10B981', // Green-500
		toColor: '#065F46', // Green-800
		stores: ['Spotify'],
	},
	{
		_id: 'visa',
		name: 'Visa',
		fromColor: '#2563EB', // Blue-600
		toColor: '#6D28D9', // Purple-800
		stores: [
			'Most Retailers',
			'Online Stores',
			'Restaurants',
			'Travel',
			'Entertainment',
		],
	},
	{
		_id: 'mastercard',
		name: 'Mastercard',
		fromColor: '#F97316', // Orange-500
		toColor: '#DC2626', // Red-600
		stores: [
			'Most Retailers',
			'Online Stores',
			'Restaurants',
			'Travel',
			'Entertainment',
		],
	},
	{
		_id: 'other',
		name: 'Other',
		fromColor: '#6B7280', // Gray-500
		toColor: '#374151', // Gray-700
		stores: [],
	},
];

// List of all stores across all suppliers for selection when "other" is chosen
export const allAvailableStores: string[] = Array.from(
	new Set(predefinedSuppliers.flatMap((supplier) => supplier.stores))
)
	.filter((store) => store !== '')
	.sort();

export const getSupplierById = (id: string): Supplier => {
	return (
		predefinedSuppliers.find((s) => s._id === id) ||
		predefinedSuppliers[predefinedSuppliers.length - 1]
	);
};

export const getSupplierByName = (name: string): Supplier => {
	const supplier = predefinedSuppliers.find(
		(s) => s.name.toLowerCase() === name.toLowerCase()
	);
	return supplier || predefinedSuppliers[predefinedSuppliers.length - 1];
};
