/**
 * Shipping & returns facts shown to shoppers. Every number here has a
 * source; nothing else on the site may state shipping figures.
 *
 * Carrier (owner, 2026-11-17): Japan Post only.
 *   Standard = Japan Post ePacket (tracked) / Express = Japan Post EMS (tracked)
 *
 * Dispatch time (owner, 2026-11-17: "same speed as eBay"): per product,
 * from the product metafield `shipping.handling_days` (the handling time of
 * the product's eBay listing). No value → no dispatch line at all.
 *
 * Transit days: Japan Post "お届け日数表" (standard delivery days) for mail
 * posted in 南関東 (Kanagawa, where the shop ships from), read 2026-11-17:
 *   EMS:      https://www.post.japanpost.jp/int/deli_days/ems/minamikanto.html
 *   Airmail:  https://www.post.japanpost.jp/int/deli_days/normal/minamikanto.html
 * International ePacket travels as airmail (通常郵便物・航空便), so the
 * airmail column is used for it. Japan Post gives one "standard" number of
 * days per destination; rows marked "詳細" (city-dependent) are left out,
 * so those destinations get no estimate.
 *
 * Returns: the store's published refund policy (shared Shopify store),
 * read 2026-11-17.
 *
 * Owner decisions, 2026-11-17 evening (docs/HANDOFF-2026-11-17.md §8b):
 *   - Duties are paid by the shop (DDP) and stated on the site:
 *     "Duties included — no extra charges on delivery".
 *   - Priority-handling orders ship within 5 business days.
 *   - Free Express upgrade stays: US$300+ or 3+ items (automatic discounts,
 *     ACTIVE in Admin 2026-11-17). The discount only applies to a shipping
 *     rate of US$55 or less; it does not take US$55 off a dearer rate.
 *
 * Shipping prices (owner, 2026-11-17 night: "調べて調整して"): set per
 * Shopify market from Japan Post's official rate tables, by destination and
 * cart weight. Table and method: tokyo-card-vault
 * docs/japanpost-rates-2026-11.md §6; DHL rows from Ship&co quotes
 * (docs/data/shipandco-quotes-2026-11-17.json). The site only states the
 * lowest Express price per destination ("from"); checkout shows the exact
 * price. Express + priority handling = Express + US$20.
 * Where Japan Post EMS is not available (owner decision 2026-11-17),
 * Express is DHL Express Worldwide.
 *   - Contact: info@xon-corp.com (site.ts CONTACT_EMAIL).
 *
 * Still NOT stated: free standard shipping, insurance, FedEx.
 */

export type ShippingMethodId = 'epacket' | 'ems';

export interface ShippingMethod {
  id: ShippingMethodId;
  /** Shown to shoppers. */
  label: string;
  /** Matches the free-text value of `shipping.service` (case-insensitive). */
  match: RegExp;
}

export const SHIPPING_METHODS: Record<ShippingMethodId, ShippingMethod> = {
  epacket: {
    id: 'epacket',
    label: 'Japan Post ePacket (tracked)',
    match: /e-?packet|eパケット|(?:^|[^a-z])epl(?:[^a-z]|$)/i,
  },
  ems: {
    id: 'ems',
    label: 'Japan Post EMS (tracked)',
    match: /(?:^|[^a-z])ems(?:[^a-z]|$)|speed\s*post/i,
  },
};

export function findMethod(
  value: string | null | undefined,
): ShippingMethod | undefined {
  if (!value) return undefined;
  return Object.values(SHIPPING_METHODS).find((m) => m.match.test(value));
}

/**
 * Japan Post standard delivery days from 南関東, by destination
 * (ISO country code → [EMS, airmail]). null = not published as a single
 * number (city-dependent) or not listed.
 */
export const JAPAN_POST_DAYS: Readonly<
  Record<string, {name: string; ems: number | null; air: number | null}>
> = {
  US: {name: 'the United States', ems: null, air: 18},
  CA: {name: 'Canada', ems: 6, air: 13},
  MX: {name: 'Mexico', ems: 11, air: 18},
  GB: {name: 'the United Kingdom', ems: 5, air: 12},
  DE: {name: 'Germany', ems: 5, air: 12},
  FR: {name: 'France', ems: 6, air: 13},
  IT: {name: 'Italy', ems: 9, air: 16},
  ES: {name: 'Spain', ems: 10, air: 17},
  NL: {name: 'the Netherlands', ems: 8, air: 18},
  BE: {name: 'Belgium', ems: 8, air: 14},
  AT: {name: 'Austria', ems: 9, air: 18},
  CH: {name: 'Switzerland', ems: 7, air: 14},
  SE: {name: 'Sweden', ems: 10, air: 14},
  DK: {name: 'Denmark', ems: 8, air: 15},
  FI: {name: 'Finland', ems: 6, air: 13},
  PL: {name: 'Poland', ems: 10, air: 17},
  HU: {name: 'Hungary', ems: 12, air: 19},
  AU: {name: 'Australia', ems: null, air: 14},
  NZ: {name: 'New Zealand', ems: 9, air: 16},
  SG: {name: 'Singapore', ems: 2, air: 9},
  MY: {name: 'Malaysia', ems: 4, air: 11},
  TH: {name: 'Thailand', ems: 3, air: 10},
  VN: {name: 'Vietnam', ems: 3, air: 10},
  ID: {name: 'Indonesia', ems: 8, air: 16},
  PH: {name: 'the Philippines', ems: null, air: 19},
  TW: {name: 'Taiwan', ems: 2, air: 9},
  HK: {name: 'Hong Kong', ems: null, air: 10},
  KR: {name: 'South Korea', ems: null, air: 10},
  IN: {name: 'India', ems: 8, air: 15},
  AE: {name: 'the United Arab Emirates', ems: 9, air: 16},
  SA: {name: 'Saudi Arabia', ems: 12, air: 20},
  IL: {name: 'Israel', ems: 17, air: 20},
  TR: {name: 'Turkey', ems: 11, air: 18},
  BR: {name: 'Brazil', ems: 14, air: 17},
  AR: {name: 'Argentina', ems: 14, air: 16},
  PE: {name: 'Peru', ems: 8, air: 17},
};

/** Standard transit days for a destination and method, or null. */
export function transitDays(
  country: string | null | undefined,
  method: ShippingMethodId,
): number | null {
  const row = JAPAN_POST_DAYS[(country ?? '').toUpperCase()];
  if (!row) return null;
  return method === 'ems' ? row.ems : row.air;
}

export function destinationName(country: string | null | undefined): string {
  return JAPAN_POST_DAYS[(country ?? '').toUpperCase()]?.name ?? 'your country';
}

export function handlingLabel(days: number): string {
  if (days === 0) return 'Ships the same business day';
  return days === 1
    ? 'Ships within 1 business day'
    : `Ships within ${days} business days`;
}

/** Duties are prepaid by the shop (owner decision 2026-11-17). */
export const DUTIES = {
  included: true,
  line: 'Duties included — no extra charges on delivery',
} as const;

/**
 * Paid faster options. `handling`: 'item' = the item's own dispatch time
 * (shipping.handling_days); a number = ship within that many business days
 * at most. `extraUsd` is added to the Express price.
 */
export interface ExpressOption {
  label: string;
  extraUsd: number;
  handling: 'item' | number;
}
export const EXPRESS_OPTIONS: readonly ExpressOption[] = [
  {label: 'Express', extraUsd: 0, handling: 'item'},
  {label: 'Express + priority handling', extraUsd: 20, handling: 5},
];

export const DHL_EXPRESS_LABEL = 'DHL Express Worldwide (tracked)';

export interface ExpressRegion {
  region: string;
  carrier: 'ems' | 'dhl';
  /** Lowest Express price (USD) at checkout for this destination. */
  fromUsd: number;
  countries: readonly string[];
}

/**
 * Live checkout Express prices by Shopify market, read back from Admin
 * 2026-11-17 (lightest weight tier). Keep in sync with the store: re-read
 * with tokyo-card-vault scripts/shipping-rates/read-markets.mjs after any
 * change to the markets' shipping.
 */
export const EXPRESS_REGIONS: readonly ExpressRegion[] = [
  {region: 'United States', carrier: 'ems', fromUsd: 25, countries: ['US']},
  {region: 'Canada and Mexico', carrier: 'ems', fromUsd: 25, countries: ['CA', 'MX']},
  {
    region: 'UK and Western Europe (16 countries)',
    carrier: 'ems',
    fromUsd: 13,
    countries: ['ES', 'GB', 'IE', 'IT', 'PT', 'AT', 'BE', 'CH', 'DK', 'FI', 'NL', 'NO', 'PL', 'SE', 'DE', 'FR'],
  },
  {
    region: 'East and Southeast Asia, Australia, New Zealand',
    carrier: 'ems',
    fromUsd: 13,
    countries: ['AU', 'HK', 'ID', 'KR', 'MY', 'NZ', 'PH', 'TH', 'SG', 'TW', 'VN'],
  },
  {
    region: 'South Asia, Mongolia, Cambodia, Laos, Brunei',
    carrier: 'ems',
    fromUsd: 19,
    countries: ['IN', 'BN', 'KH', 'LA', 'LK', 'MN', 'MV', 'NP'],
  },
  {
    region: 'Other European countries and Turkey',
    carrier: 'ems',
    fromUsd: 27,
    countries: ['RO', 'TR', 'AD', 'BG', 'CY', 'CZ', 'EE', 'GR', 'HR', 'HU', 'IS', 'LI', 'LT', 'LU', 'LV', 'MC', 'MK', 'MT', 'SI', 'SK', 'SM'],
  },
  {region: 'Fiji, New Caledonia, Papua New Guinea', carrier: 'ems', fromUsd: 27, countries: ['FJ', 'NC', 'PG']},
  {
    region: 'Middle East and Africa',
    carrier: 'ems',
    fromUsd: 30,
    countries: ['AE', 'EG', 'KW', 'ZA', 'BH', 'BW', 'DZ', 'GH', 'IL', 'JO', 'KE', 'MA', 'MU', 'OM', 'QA', 'SA', 'SN', 'TN', 'TZ', 'UG'],
  },
  {
    region: 'Latin America and the Caribbean',
    carrier: 'ems',
    fromUsd: 30,
    countries: ['AR', 'BR', 'CL', 'CO', 'CR', 'PA', 'PE', 'SV', 'UY', 'EC', 'HN', 'JM', 'PY', 'TT'],
  },
  {
    region: 'Albania, Bosnia and Herzegovina, Montenegro, Serbia, Vatican City',
    carrier: 'dhl',
    fromUsd: 47,
    countries: ['AL', 'BA', 'ME', 'RS', 'VA'],
  },
  {region: 'Bolivia, Namibia', carrier: 'dhl', fromUsd: 51, countries: ['BO', 'NA']},
  {
    region: 'Moldova, Guatemala, Nicaragua, the Bahamas, Dominican Republic',
    carrier: 'dhl',
    fromUsd: 52,
    countries: ['MD', 'GT', 'NI', 'BS', 'DO'],
  },
];

/** Lowest Express price anywhere (for pages that don't know the country). */
export const EXPRESS_FROM_MIN_USD = Math.min(
  ...EXPRESS_REGIONS.map((r) => r.fromUsd),
);

export function expressRegionFor(
  country: string | null | undefined,
): ExpressRegion | undefined {
  const cc = (country ?? '').toUpperCase();
  return EXPRESS_REGIONS.find((r) => r.countries.includes(cc));
}

export function expressCarrierLabel(carrier: 'ems' | 'dhl'): string {
  return carrier === 'dhl' ? DHL_EXPRESS_LABEL : SHIPPING_METHODS.ems.label;
}

/** "from US$45" for an option and destination (or the store-wide lowest). */
export function expressFromText(
  o: ExpressOption,
  country?: string | null,
): string {
  const r = expressRegionFor(country);
  return `from US$${(r ? r.fromUsd : EXPRESS_FROM_MIN_USD) + o.extraUsd}`;
}

export const PRICE_AT_CHECKOUT =
  'Prices depend on your destination and the weight of your parcel; the exact price is shown at checkout, before you pay.';

/** Business days to dispatch for an option, given the item's own days. */
export function optionHandlingDays(
  o: ExpressOption,
  itemDays: number | null,
): number | null {
  if (o.handling === 'item') return itemDays;
  return itemDays == null ? o.handling : Math.min(itemDays, o.handling);
}

/** Free Express upgrade discount (store-wide, kept by the owner). */
export const EXPRESS_PROMO_LIVE = true;
export const EXPRESS_UPGRADE = {
  subtotalThreshold: 300,
  quantityThreshold: 3,
  /** The discount applies only to shipping rates at or below this. */
  maxShippingValue: 55,
  currency: 'USD',
} as const;

export const EXPRESS_UPGRADE_LINE = `Free Express upgrade on orders of US$${EXPRESS_UPGRADE.subtotalThreshold}+ or ${EXPRESS_UPGRADE.quantityThreshold}+ items, when the shipping rate is US$${EXPRESS_UPGRADE.maxShippingValue} or less.`;

/**
 * The Shopify policies (/policies/*) are store-wide and currently carry Spin
 * Vault's text. Do not link them until the shared wording is applied
 * (docs/policy-draft.md).
 */
export const LINK_STORE_POLICIES = false;

/**
 * RETURNS are the store's actual refund rules (one Shopify store, one refund
 * policy, applied at checkout to all three Vault sites; read 2026-11-17).
 * The policy PAGE is not linked/served only because its wording names
 * another store and states free shipping / duties (see LINK_STORE_POLICIES);
 * the return conditions themselves apply to this site's orders.
 */
export const RETURNS = {
  windowDays: 14,
  summary:
    'Returns within 14 days of delivery for items in their original, unopened, sealed condition. Return shipping is paid by the buyer.',
  damaged:
    'Arrived damaged? Contact us within 48 hours of delivery with photos.',
  policyPath: '/policies/refund-policy',
} as const;

export const SHIPPING_POLICY_PATH = '/policies/shipping-policy';
