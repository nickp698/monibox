export { LightTheme, DarkTheme, Spacing, Radius, Typography } from './colors';

// Category definitions matching the web app
export const CATEGORIES = {
  // Assets
  bank_account: { label: 'Bank Accounts', icon: '🏦', group: 'assets', color: '#1a4f8a' },
  investment: { label: 'Investments', icon: '📈', group: 'assets', color: '#2d5a3d' },
  pension: { label: 'Pensions', icon: '🏛', group: 'assets', color: '#5a3d8a' },
  property: { label: 'Property', icon: '🏠', group: 'assets', color: '#8a5a2d' },
  crypto_holding: { label: 'Crypto', icon: '₿', group: 'assets', color: '#f7931a' },
  stock_holding: { label: 'Stocks', icon: '📊', group: 'assets', color: '#1e7e4a' },
  bond_holding: { label: 'Bonds', icon: '📜', group: 'assets', color: '#4a6e8a' },

  // Liabilities
  credit_card: { label: 'Credit Cards', icon: '💳', group: 'liabilities', color: '#c0392b' },
  mortgage: { label: 'Mortgages', icon: '🏡', group: 'liabilities', color: '#8a2d2d' },
  loan: { label: 'Loans', icon: '💰', group: 'liabilities', color: '#b85c00' },

  // Lifestyle
  insurance_policy: { label: 'Insurance', icon: '🛡', group: 'lifestyle', color: '#2d5a8a' },
  bill: { label: 'Bills', icon: '📄', group: 'lifestyle', color: '#5a8a2d' },
  subscription: { label: 'Subscriptions', icon: '🔄', group: 'lifestyle', color: '#8a2d5a' },
  vehicle: { label: 'Vehicles', icon: '🚗', group: 'lifestyle', color: '#3d5a7a' },
  pet: { label: 'Pets', icon: '🐾', group: 'lifestyle', color: '#7a5a3d' },
  family_health: { label: 'Family Health', icon: '❤️', group: 'lifestyle', color: '#c0392b' },

  // Documents
  next_of_kin: { label: 'Next of Kin', icon: '👥', group: 'documents', color: '#2d3d5a' },
  kyc_document: { label: 'KYC Documents', icon: '📋', group: 'documents', color: '#5a5a5a' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Format currency with locale
export function formatCurrency(value: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Get display name for a vault item
export function getItemName(category: CategoryKey, data: any): string {
  return (
    data?.name ||
    data?.provider ||
    data?.bank_name ||
    data?.lender ||
    data?.insurer ||
    data?.company ||
    data?.pet_name ||
    data?.full_name ||
    data?.ticker ||
    data?.symbol ||
    CATEGORIES[category]?.label ||
    'Untitled'
  );
}

// Get value from a vault item
export function getItemValue(category: CategoryKey, data: any): number {
  return parseFloat(
    data?.balance ||
    data?.value ||
    data?.current_value ||
    data?.amount ||
    data?.outstanding_balance ||
    data?.market_value ||
    '0'
  );
}
