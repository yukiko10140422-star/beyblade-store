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
 * posted in 南関東 (Kanagawa, where the shop ships from), read 2026-11-17,
 * re-read 2026-11-25 (same numbers for the countries kept):
 *   EMS:      https://www.post.japanpost.jp/send/oversea/date/ems/minamikanto.html
 *   Airmail:  https://www.post.japanpost.jp/send/oversea/date/normal/minamikanto.html
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
 * Express is DHL Express Worldwide, priced at the Ship&co quote x 1.2 +
 * US$6 (box sizes are assumed, so volumetric weight may be higher).
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
 *
 * Owner decision 2026-11-25: the shop ships to these 20 countries and
 * territories only (Shopify markets trimmed the same day; AE added and MD
 * (Moldova) removed later the same day, owner approvals). The rest were
 * dropped for tax-ID requirements at customs, Japan Post suspensions /
 * requests to refrain, or unverified risk — table: tokyo-card-vault
 * docs/data/duty-taxid-20261125/duty-taxid-by-country.md.
 * NO, IS, LI, AD, MC, SM and MO are not on Japan Post's 南関東 tables
 * (2026-11-25), so they have no estimate (not copied from a neighbour).
 */
export const JAPAN_POST_DAYS: Readonly<
  Record<string, {name: string; ems: number | null; air: number | null}>
> = {
  US: {name: 'the United States', ems: null, air: 18},
  CA: {name: 'Canada', ems: 6, air: 13},
  GB: {name: 'the United Kingdom', ems: 5, air: 12},
  CH: {name: 'Switzerland', ems: 7, air: 14},
  NO: {name: 'Norway', ems: null, air: null},
  IS: {name: 'Iceland', ems: null, air: null},
  LI: {name: 'Liechtenstein', ems: null, air: null},
  AD: {name: 'Andorra', ems: null, air: null},
  MC: {name: 'Monaco', ems: null, air: null},
  SM: {name: 'San Marino', ems: null, air: null},
  AU: {name: 'Australia', ems: null, air: 14},
  NZ: {name: 'New Zealand', ems: 9, air: 16},
  HK: {name: 'Hong Kong', ems: null, air: 10},
  MO: {name: 'Macau', ems: null, air: null},
  KR: {name: 'South Korea', ems: null, air: 10},
  TW: {name: 'Taiwan', ems: 2, air: 9},
  SG: {name: 'Singapore', ems: 2, air: 9},
  MY: {name: 'Malaysia', ems: 4, air: 11},
  TH: {name: 'Thailand', ems: 3, air: 10},
  AE: {name: 'the United Arab Emirates', ems: 9, air: 16},
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
  /** For pages that don't know the buyer's country. */
  lineAll:
    'Duties included — no extra charges on delivery (except the United Arab Emirates)',
} as const;

/**
 * Owner decision 2026-11-25 (UAE added to the destinations): for the UAE,
 * import duties and VAT are paid by the buyer, and the address needs a UAE
 * mobile number (tokyo-card-vault docs/data/duty-taxid-20261125/, UAE notes:
 * import VAT 5% is charged to the importer; Japan Post asks for a mobile
 * number and e-mail). Nothing else (no delivery promise) is stated.
 */
export const BUYER_PAYS_DUTIES: ReadonlySet<string> = new Set(['AE']);
export const UAE_NOTE =
  'United Arab Emirates: import duties and VAT are not included and are paid by the buyer. Please add a UAE mobile phone number to your address.';
export function dutiesIncludedFor(country: string | null | undefined): boolean {
  return !BUYER_PAYS_DUTIES.has((country ?? '').toUpperCase());
}

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
  {region: 'Canada', carrier: 'ems', fromUsd: 25, countries: ['CA']},
  {region: 'UK, Switzerland, Norway', carrier: 'ems', fromUsd: 13, countries: ['GB', 'CH', 'NO']},
  {
    region: 'Hong Kong, Macau, South Korea, Taiwan, Singapore, Malaysia, Thailand',
    carrier: 'ems',
    fromUsd: 7,
    countries: ['HK', 'MO', 'KR', 'TW', 'SG', 'MY', 'TH'],
  },
  {region: 'Australia and New Zealand', carrier: 'ems', fromUsd: 13, countries: ['AU', 'NZ']},
  {
    region: 'Andorra, Liechtenstein, Monaco, San Marino',
    carrier: 'ems',
    fromUsd: 27,
    countries: ['AD', 'LI', 'MC', 'SM'],
  },
  // DHL market (owner 2026-11-17: Ship&co quote x 1.2 + US$6).
  {region: 'United Arab Emirates', carrier: 'ems', fromUsd: 30, countries: ['AE']},
  {region: 'Iceland', carrier: 'dhl', fromUsd: 55, countries: ['IS']},
];

/**
 * Every destination the shop ships to (owner decision 2026-11-25: these 20
 * only). Anything else — the EU included — gets no delivery at checkout.
 */
export const SHIP_TO_COUNTRIES: ReadonlySet<string> = new Set(
  EXPRESS_REGIONS.flatMap((r) => r.countries),
);

/** True when the shop ships to the country (unknown country → true). */
export function shipsTo(country: string | null | undefined): boolean {
  const cc = (country ?? '').toUpperCase();
  return !cc || SHIP_TO_COUNTRIES.has(cc);
}

/**
 * Owner decision 2026-11-17: no shipping to the 27 EU member states (removed
 * from every Shopify market, so checkout offers no delivery there).
 */
export const EU_COUNTRIES: ReadonlySet<string> = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);
const SHIP_TO_NAMES = [...SHIP_TO_COUNTRIES].map(
  (cc) => JAPAN_POST_DAYS[cc]?.name ?? cc,
);
/** "We ship to 20 countries and territories: …" (from SHIP_TO_COUNTRIES). */
export const WHERE_WE_SHIP_LINE = `We ship to ${SHIP_TO_NAMES.length} countries and territories: ${SHIP_TO_NAMES.slice(0, -1).join(', ')} and ${SHIP_TO_NAMES[SHIP_TO_NAMES.length - 1]}. We do not ship to other countries, including the European Union.`;

/**
 * Japan Post has suspended small packets to these countries (差出可否早見表,
 * 2026-10-23), so checkout offers DHL Express only — no standard method.
 */
export const NO_STANDARD_COUNTRIES: ReadonlySet<string> = new Set<string>([]);

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
 * The Shopify policies (/policies/*) are store-wide. The shared wording for
 * all three stores (tokyo-card-vault docs/policy-final-2026-11-17.md) was
 * applied 2026-11-17 (owner OK) to refund, shipping, terms and contact.
 */
export const LINK_STORE_POLICIES = true;

/**
 * Privacy policy: the owner decided (2026-11-17 late) to KEEP Shopify's
 * automatic management. The page shows the store's privacyPolicy exactly as
 * Shopify generates it (the replacement text in docs/policy-final is NOT
 * used). Linked from the footer.
 */
export const PRIVACY_POLICY_READY = true;

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

/**
 * Countries where the standard method (Japan Post ePacket) is FREE at
 * checkout. Owner decision 2026-11-18: say "Free tracked shipping to <country>"
 * only for these countries, and only when the buyer's country is known.
 * SOURCE: the store's market shipping rates as quoted at checkout, read with
 * Storefront API carts on 2026-11-18 (tokyo-vaults/scripts/check-country-shipping.mjs,
 * result tokyo-vaults/.out/country-shipping.json). Re-read after any change
 * to the market rates; verify.mjs compares this list with checkout.
 * Re-read 2026-11-25 after trimming to 20 destinations (MO added, MX/ID/VN/MD removed; AE is paid).
 */
export const FREE_STANDARD_COUNTRIES: ReadonlySet<string> = new Set([
  'US', 'CA', 'GB', 'CH', 'NO', 'AU', 'NZ', 'SG', 'HK', 'MO', 'TW', 'KR',
  'TH', 'MY',
]);

/** Destination name when standard shipping there is free, else null. */
export function freeStandardTo(country: string | null | undefined): string | null {
  const cc = (country ?? '').toUpperCase();
  if (!cc || !FREE_STANDARD_COUNTRIES.has(cc)) return null;
  if (!SHIP_TO_COUNTRIES.has(cc) || NO_STANDARD_COUNTRIES.has(cc)) return null;
  return destinationName(cc);
}

/** Checkout runs on the shared store's myshopify domain (one store, 3 sites). */
export const CHECKOUT_DOMAIN_FALLBACK = 'tokyo-spin-vault.myshopify.com';

/** Shown instead of Add to cart for destinations the shop does not ship to. */
export const NO_SHIP_BUTTON_NOTE =
  'We do not ship to your selected country. Choose your country with “Ship to” at the top of the page.';
