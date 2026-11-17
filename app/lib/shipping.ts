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
 * Deliberately NOT stated (not decided): free shipping, duties included /
 * DDP, insurance, DHL / FedEx, and the free Express upgrade wording (the
 * store has an automatic discount — US$300+ or 3+ items, up to US$55
 * shipping value, confirmed in Admin 2026-11-17 — but the Express offer is
 * being redesigned, so EXPRESS_PROMO_LIVE is false).
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

/**
 * Paid faster options (Express = EMS, Express + priority handling).
 * Prices and dispatch times are not decided yet → empty = the rows are not
 * rendered. Fill in from the agreed plan (same conditions as eBay).
 */
export interface ExpressOption {
  label: string;
  method: ShippingMethodId;
  /** e.g. "US$25.00" — shown as written. */
  price: string;
  /** Business days to dispatch with this option. */
  handlingDays: number;
}
export const EXPRESS_OPTIONS: readonly ExpressOption[] = [];

/** Free Express upgrade discount (store-wide). Hidden until re-decided. */
export const EXPRESS_PROMO_LIVE = false;
export const EXPRESS_UPGRADE = {
  subtotalThreshold: 300,
  quantityThreshold: 3,
  maxShippingValue: 55,
  currency: 'USD',
} as const;

/**
 * The Shopify policies (/policies/*) are store-wide and currently carry Spin
 * Vault's text. Do not link them until the shared wording is applied
 * (docs/policy-draft.md).
 */
export const LINK_STORE_POLICIES = false;

export const RETURNS = {
  windowDays: 14,
  summary:
    'Returns within 14 days of delivery for items in their original, unopened, sealed condition. Return shipping is paid by the buyer.',
  damaged:
    'Arrived damaged? Contact us within 48 hours of delivery with photos.',
  policyPath: '/policies/refund-policy',
} as const;

export const SHIPPING_POLICY_PATH = '/policies/shipping-policy';
