// Every country the site supports. To add a country later:
//  1. add one object to COUNTRIES below
//  2. add products with that country's code in src/data/products/*.json
//  3. join that country's affiliate programs and add their disclosure to BaseLayout.astro

export interface Country {
  code: string; // two-letter code, matches "country" in the product files
  name: string;
  currency: string; // currency code, e.g. "PHP"
  locale: string; // controls number formatting, e.g. "₱29,999"
  stores: string[];
  budgetExample: number; // shown as the hint in the budget box
  timeZones: string[]; // used to guess a visitor's country (see guessCountry below)
}

export const COUNTRIES: Country[] = [
  {
    code: 'PH',
    name: 'Philippines',
    currency: 'PHP',
    locale: 'en-PH',
    stores: ['Shopee', 'Lazada'],
    budgetExample: 30000,
    timeZones: ['Asia/Manila'],
  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;
}

// Turns 29999 into "₱29,999".
export function formatPrice(amount: number, country: Country): string {
  return new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Guesses the visitor's country from their device's time zone.
// No internet request and no personal data: the browser already knows its time zone.
// Returns null if it's not one of our countries (or the browser won't say).
export function guessCountry(): Country | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return COUNTRIES.find((c) => c.timeZones.includes(zone)) ?? null;
  } catch {
    return null;
  }
}

// Countries people can ask for in the "My country isn't listed" box.
// Their answers show up in Google Analytics, so you know where to expand next.
export const REQUESTABLE_COUNTRIES = [
  'AE', 'AU', 'BD', 'BR', 'CA', 'DE', 'ES', 'FR', 'GB', 'HK', 'ID', 'IE', 'IN', 'IT', 'JP', 'KR',
  'MX', 'MY', 'NG', 'NL', 'NZ', 'PK', 'SA', 'SE', 'SG', 'TH', 'TW', 'VN', 'ZA',
];
