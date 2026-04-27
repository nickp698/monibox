/**
 * Form field definitions for each vault category
 * Matches the web app's field structure
 */

export type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'email' | 'phone' | 'select' | 'toggle' | 'textarea';
  placeholder?: string;
  required?: boolean;
  prefix?: string;
  options?: { label: string; value: string }[];
};

export const FORM_DEFINITIONS: Record<string, FieldDef[]> = {
  bank_account: [
    { key: 'name', label: 'Account Name', type: 'text', placeholder: 'e.g. Current Account', required: true },
    { key: 'bank_name', label: 'Bank', type: 'text', placeholder: 'e.g. HSBC' },
    { key: 'account_type', label: 'Type', type: 'select', options: [
      { label: 'Current', value: 'current' },
      { label: 'Savings', value: 'savings' },
      { label: 'ISA', value: 'isa' },
      { label: 'Joint', value: 'joint' },
    ]},
    { key: 'balance', label: 'Balance', type: 'currency', prefix: '£', placeholder: '0.00' },
    { key: 'sort_code', label: 'Sort Code', type: 'text', placeholder: 'e.g. 40-47-84' },
    { key: 'account_number', label: 'Account Number', type: 'text', placeholder: '••••••••' },
    { key: 'rate', label: 'Interest Rate (%)', type: 'number', placeholder: 'e.g. 4.5' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  credit_card: [
    { key: 'name', label: 'Card Name', type: 'text', placeholder: 'e.g. Amex Gold', required: true },
    { key: 'provider', label: 'Provider', type: 'text', placeholder: 'e.g. American Express' },
    { key: 'balance', label: 'Outstanding Balance', type: 'currency', prefix: '£', placeholder: '0.00' },
    { key: 'credit_limit', label: 'Credit Limit', type: 'currency', prefix: '£' },
    { key: 'apr', label: 'APR (%)', type: 'number', placeholder: 'e.g. 21.9' },
    { key: 'minimum_payment', label: 'Minimum Payment', type: 'currency', prefix: '£' },
    { key: 'payment_date', label: 'Payment Due Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  mortgage: [
    { key: 'name', label: 'Mortgage Name', type: 'text', placeholder: 'e.g. Primary Residence', required: true },
    { key: 'lender', label: 'Lender', type: 'text', placeholder: 'e.g. Nationwide' },
    { key: 'balance', label: 'Outstanding Balance', type: 'currency', prefix: '£' },
    { key: 'property_value', label: 'Property Value', type: 'currency', prefix: '£' },
    { key: 'rate', label: 'Interest Rate (%)', type: 'number' },
    { key: 'rate_type', label: 'Rate Type', type: 'select', options: [
      { label: 'Fixed', value: 'fixed' },
      { label: 'Variable', value: 'variable' },
      { label: 'Tracker', value: 'tracker' },
    ]},
    { key: 'monthly_payment', label: 'Monthly Payment', type: 'currency', prefix: '£' },
    { key: 'term_end', label: 'Term End Date', type: 'date' },
    { key: 'renewal', label: 'Rate Renewal Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  loan: [
    { key: 'name', label: 'Loan Name', type: 'text', required: true },
    { key: 'lender', label: 'Lender', type: 'text' },
    { key: 'balance', label: 'Outstanding Balance', type: 'currency', prefix: '£' },
    { key: 'original_amount', label: 'Original Amount', type: 'currency', prefix: '£' },
    { key: 'rate', label: 'Interest Rate (%)', type: 'number' },
    { key: 'monthly_payment', label: 'Monthly Payment', type: 'currency', prefix: '£' },
    { key: 'end_date', label: 'End Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  insurance_policy: [
    { key: 'name', label: 'Policy Name', type: 'text', required: true },
    { key: 'insurer', label: 'Insurer', type: 'text' },
    { key: 'policy_type', label: 'Type', type: 'select', options: [
      { label: 'Life', value: 'life' },
      { label: 'Home', value: 'home' },
      { label: 'Contents', value: 'contents' },
      { label: 'Car', value: 'car' },
      { label: 'Health', value: 'health' },
      { label: 'Travel', value: 'travel' },
      { label: 'Pet', value: 'pet' },
      { label: 'Other', value: 'other' },
    ]},
    { key: 'premium', label: 'Premium', type: 'currency', prefix: '£' },
    { key: 'period', label: 'Payment Frequency', type: 'select', options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Annual', value: 'annual' },
    ]},
    { key: 'cover_amount', label: 'Cover Amount', type: 'currency', prefix: '£' },
    { key: 'policy_number', label: 'Policy Number', type: 'text' },
    { key: 'renewal', label: 'Renewal Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  bill: [
    { key: 'name', label: 'Bill Name', type: 'text', required: true, placeholder: 'e.g. Electricity' },
    { key: 'provider', label: 'Provider', type: 'text' },
    { key: 'cost', label: 'Amount', type: 'currency', prefix: '£' },
    { key: 'period', label: 'Frequency', type: 'select', options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Annual', value: 'annual' },
    ]},
    { key: 'next_bill', label: 'Next Bill Date', type: 'date' },
    { key: 'renewal', label: 'Contract End', type: 'date' },
    { key: 'account_number', label: 'Account Number', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  subscription: [
    { key: 'name', label: 'Subscription', type: 'text', required: true, placeholder: 'e.g. Netflix' },
    { key: 'provider', label: 'Provider', type: 'text' },
    { key: 'cost', label: 'Amount', type: 'currency', prefix: '£' },
    { key: 'period', label: 'Frequency', type: 'select', options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Annual', value: 'annual' },
    ]},
    { key: 'renewal', label: 'Next Renewal', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  investment: [
    { key: 'name', label: 'Investment Name', type: 'text', required: true },
    { key: 'provider', label: 'Provider', type: 'text' },
    { key: 'value', label: 'Current Value', type: 'currency', prefix: '£' },
    { key: 'invested', label: 'Amount Invested', type: 'currency', prefix: '£' },
    { key: 'investment_type', label: 'Type', type: 'select', options: [
      { label: 'Stocks & Shares ISA', value: 'isa' },
      { label: 'Fund', value: 'fund' },
      { label: 'ETF', value: 'etf' },
      { label: 'Trust', value: 'trust' },
      { label: 'Other', value: 'other' },
    ]},
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  pension: [
    { key: 'name', label: 'Pension Name', type: 'text', required: true },
    { key: 'provider', label: 'Provider', type: 'text' },
    { key: 'value', label: 'Current Value', type: 'currency', prefix: '£' },
    { key: 'pension_type', label: 'Type', type: 'select', options: [
      { label: 'Workplace', value: 'workplace' },
      { label: 'Personal', value: 'personal' },
      { label: 'SIPP', value: 'sipp' },
      { label: 'State', value: 'state' },
    ]},
    { key: 'employer_contribution', label: 'Employer Contribution (%)', type: 'number' },
    { key: 'personal_contribution', label: 'Personal Contribution (%)', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  property: [
    { key: 'name', label: 'Property Name', type: 'text', required: true, placeholder: 'e.g. Family Home' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'value', label: 'Estimated Value', type: 'currency', prefix: '£' },
    { key: 'property_type', label: 'Type', type: 'select', options: [
      { label: 'Residential', value: 'residential' },
      { label: 'Buy-to-Let', value: 'btl' },
      { label: 'Commercial', value: 'commercial' },
    ]},
    { key: 'rental_income', label: 'Monthly Rental Income', type: 'currency', prefix: '£' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  vehicle: [
    { key: 'name', label: 'Vehicle', type: 'text', required: true, placeholder: 'e.g. BMW 3 Series' },
    { key: 'registration', label: 'Registration', type: 'text' },
    { key: 'value', label: 'Current Value', type: 'currency', prefix: '£' },
    { key: 'mot_date', label: 'MOT Due', type: 'date' },
    { key: 'tax_date', label: 'Tax Due', type: 'date' },
    { key: 'insurance_renewal', label: 'Insurance Renewal', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  crypto_holding: [
    { key: 'name', label: 'Coin / Token', type: 'text', required: true, placeholder: 'e.g. Bitcoin' },
    { key: 'symbol', label: 'Symbol', type: 'text', placeholder: 'e.g. BTC' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'avg_buy_price', label: 'Avg. Buy Price', type: 'currency', prefix: '£' },
    { key: 'current_value', label: 'Current Value', type: 'currency', prefix: '£' },
    { key: 'wallet', label: 'Wallet / Exchange', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  stock_holding: [
    { key: 'name', label: 'Company', type: 'text', required: true },
    { key: 'ticker', label: 'Ticker', type: 'text', placeholder: 'e.g. AAPL' },
    { key: 'shares', label: 'Shares', type: 'number' },
    { key: 'avg_price', label: 'Avg. Buy Price', type: 'currency', prefix: '£' },
    { key: 'current_value', label: 'Current Value', type: 'currency', prefix: '£' },
    { key: 'broker', label: 'Broker', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  bond_holding: [
    { key: 'name', label: 'Bond Name', type: 'text', required: true },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'value', label: 'Face Value', type: 'currency', prefix: '£' },
    { key: 'coupon_rate', label: 'Coupon Rate (%)', type: 'number' },
    { key: 'maturity_date', label: 'Maturity Date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  pet: [
    { key: 'pet_name', label: 'Pet Name', type: 'text', required: true },
    { key: 'species', label: 'Species', type: 'select', options: [
      { label: 'Dog', value: 'dog' },
      { label: 'Cat', value: 'cat' },
      { label: 'Fish', value: 'fish' },
      { label: 'Bird', value: 'bird' },
      { label: 'Other', value: 'other' },
    ]},
    { key: 'breed', label: 'Breed', type: 'text' },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    { key: 'microchip', label: 'Microchip Number', type: 'text' },
    { key: 'vet', label: 'Vet Practice', type: 'text' },
    { key: 'insurance', label: 'Insurance Provider', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  family_health: [
    { key: 'full_name', label: 'Full Name', type: 'text', required: true },
    { key: 'relationship', label: 'Relationship', type: 'text', placeholder: 'e.g. Spouse, Child' },
    { key: 'nhs_number', label: 'NHS Number', type: 'text' },
    { key: 'gp_practice', label: 'GP Practice', type: 'text' },
    { key: 'blood_type', label: 'Blood Type', type: 'select', options: [
      { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
      { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
      { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
      { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
    ]},
    { key: 'allergies', label: 'Allergies', type: 'textarea' },
    { key: 'medications', label: 'Current Medications', type: 'textarea' },
    { key: 'conditions', label: 'Medical Conditions', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],

  next_of_kin: [
    { key: 'full_name', label: 'Full Name', type: 'text', required: true },
    { key: 'relationship', label: 'Relationship', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'phone' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'is_primary', label: 'Primary Contact', type: 'toggle' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};
