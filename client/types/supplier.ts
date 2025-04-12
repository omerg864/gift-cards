export interface Supplier {
	id: string;
	name: string;
	fromColor: string;
  toColor: string;
	logo?: string;
	supportedStores: string[]; // Added supported stores to supplier
}
export const predefinedSuppliers: Supplier[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    fromColor: '#1E3A8A', // Blue-700
    toColor: '#1E40AF', // Blue-900
    supportedStores: [
      'Amazon',
      'Amazon Fresh',
      'Whole Foods',
      'Amazon Books',
      'Amazon Go',
    ],
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    fromColor: '#047857', // Green-600
    toColor: '#065F46', // Green-900
    supportedStores: ['Starbucks', 'Starbucks Reserve', 'Teavana'],
  },
  {
    id: 'target',
    name: 'Target',
    fromColor: '#DC2626', // Red-600
    toColor: '#991B1B', // Red-800
    supportedStores: ['Target', 'Target Online', 'Shipt', 'Target Optical'],
  },
  {
    id: 'walmart',
    name: 'Walmart',
    fromColor: '#2563EB', // Blue-500
    toColor: '#3730A3', // Indigo-700
    supportedStores: [
      'Walmart',
      'Walmart.com',
      "Sam's Club",
      'Walmart Pharmacy',
      'Walmart Grocery',
    ],
  },
  {
    id: 'bestbuy',
    name: 'Best Buy',
    fromColor: '#F59E0B', // Yellow-500
    toColor: '#B45309', // Yellow-700
    supportedStores: [
      'Best Buy',
      'Best Buy Online',
      'Best Buy Mobile',
      'Geek Squad',
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    fromColor: '#374151', // Gray-700
    toColor: '#1F2937', // Gray-900
    supportedStores: [
      'Apple Store',
      'Apple Online',
      'App Store',
      'iTunes',
      'Apple Music',
    ],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    fromColor: '#B91C1C', // Red-700
    toColor: '#7F1D1D', // Red-900
    supportedStores: ['Netflix'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    fromColor: '#10B981', // Green-500
    toColor: '#065F46', // Green-800
    supportedStores: ['Spotify'],
  },
  {
    id: 'visa',
    name: 'Visa',
    fromColor: '#2563EB', // Blue-600
    toColor: '#6D28D9', // Purple-800
    supportedStores: [
      'Most Retailers',
      'Online Stores',
      'Restaurants',
      'Travel',
      'Entertainment',
    ],
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    fromColor: '#F97316', // Orange-500
    toColor: '#DC2626', // Red-600
    supportedStores: [
      'Most Retailers',
      'Online Stores',
      'Restaurants',
      'Travel',
      'Entertainment',
    ],
  },
  {
    id: 'other',
    name: 'Other',
    fromColor: '#6B7280', // Gray-500
    toColor: '#374151', // Gray-700
    supportedStores: [],
  },
];

// List of all stores across all suppliers for selection when "other" is chosen
export const allAvailableStores: string[] = Array.from(
	new Set(predefinedSuppliers.flatMap((supplier) => supplier.supportedStores))
)
	.filter((store) => store !== '')
	.sort();

export const getSupplierById = (id: string): Supplier => {
	return (
		predefinedSuppliers.find((s) => s.id === id) ||
		predefinedSuppliers[predefinedSuppliers.length - 1]
	);
};

export const getSupplierByName = (name: string): Supplier => {
	const supplier = predefinedSuppliers.find(
		(s) => s.name.toLowerCase() === name.toLowerCase()
	);
	return supplier || predefinedSuppliers[predefinedSuppliers.length - 1];
};
