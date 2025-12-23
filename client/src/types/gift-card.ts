// Re-export shared Card type as GiftCard for client
export type { Card as GiftCard } from '@shared/types/card.types';

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
