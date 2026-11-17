/**
 * Tokyo Spin Vault — site identity, shelves, store scoping and public facts.
 * Every fact shown to shoppers lives here or in ~/lib/shipping, with its
 * source, so it can be reviewed in one place.
 *
 * The Shopify store is shared with Tokyo Card Vault and Tokyo Character
 * Vault. Only products with SCOPE_TAG are shown here (allowlist).
 */

export const SITE = {
  name: 'Tokyo Spin Vault',
  shortName: 'Spin Vault',
} as const;

/**
 * Store scope (allowlist). Since 2026-11-17 the three Vault sites run as ONE
 * Hydrogen app on this storefront, and the Card / Character products are
 * published to this storefront too. So a product is shown here only if it
 * carries Spin's own tag. `store:tokyo-spin-vault` is set on every Spin
 * product by the eBay import tool (beyblade-store/scripts/ebay-shopify).
 * Products without it (the old pre-import catalog) are not shown.
 */
export const SCOPE_TAG = 'store:tokyo-spin-vault';

/** Storefront `products(query:)` string that keeps only Spin products. */
export const SCOPE_QUERY = `tag:"${SCOPE_TAG}"`;

/** Tags of the sister stores' products (shared Shopify store). */
export const EXCLUDED_TAGS = [
  'card-vault',
  'character-vault',
  'store:tokyo-card-vault',
  'store:tokyo-character-vault',
] as const;

/** Handle prefixes of the sister stores' pages / blogs / menus. */
export const SISTER_HANDLE_PREFIXES = ['card-vault-', 'character-vault-'] as const;

export function isSisterHandle(handle: string | null | undefined): boolean {
  const h = (handle ?? '').toLowerCase();
  return SISTER_HANDLE_PREFIXES.some((p) => h.startsWith(p));
}

/**
 * True only if the product carries SCOPE_TAG and no sister-store tag. Tags
 * are compared case-insensitively and trimmed.
 */
export function isOwnProduct(p: {tags?: readonly string[] | null}): boolean {
  const tags = (p.tags ?? []).map((t) => t.trim().toLowerCase());
  return (
    tags.includes(SCOPE_TAG) &&
    !tags.some((t) => (EXCLUDED_TAGS as readonly string[]).includes(t))
  );
}

export interface Shelf {
  handle: string;
  title: string;
  short: string;
  description: string;
  wide?: boolean;
}

/**
 * Shelves = the collections that exist in Shopify today (2026-11-17).
 * The design mock's Starters / Boosters / Stadiums shelves do not exist
 * yet; creating them is a Shopify change that needs the owner's approval.
 */
export const SHELVES: readonly Shelf[] = [
  {
    handle: 'beyblade-x',
    title: 'Beyblade X',
    short: 'Beyblade X',
    description: 'Japanese Takara Tomy Beyblade X releases.',
    wide: true,
  },
  {
    handle: 'pre-order',
    title: 'Pre-order',
    short: 'Pre-order',
    description: 'Upcoming releases. Each page shows the release date.',
    wide: true,
  },
  {
    handle: 'beyblade-sets-bundles',
    title: 'Sets & Bundles',
    short: 'Sets & Bundles',
    description: 'Sets and multi-item bundles.',
  },
  {
    handle: 'launchers-accessories',
    title: 'Launchers & Accessories',
    short: 'Launchers',
    description: 'Launchers, grips and other parts.',
  },
  {
    handle: 'rare-exclusive',
    title: 'Limited',
    short: 'Limited',
    description: 'Event and campaign items with limited release.',
  },
  {
    handle: 'all-beyblades',
    title: 'All products',
    short: 'All',
    description: 'Everything in the store.',
  },
] as const;

/**
 * Operating company. Source: National Tax Agency corporate number site,
 * checked 2026-11. The English company name is not decided, so it is not
 * translated.
 */
export const COMPANY = {
  displayName: 'XON (XON株式会社)',
  corporateNumber: '2020001170846',
  corporateNumberUrl:
    'https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=2020001170846',
  city: 'Yokohama, Japan',
  address:
    'Mutsumi Bldg. 3F, 2-10-48 Kitasaiwai, Nishi-ku, Yokohama, Kanagawa, Japan',
} as const;

/**
 * eBay record of the owner's eBay store (ninjapon), shown with its date.
 * SOURCE: eBay seller / feedback page, read 2026-11-17 (owner approved
 * showing the numbers). Review monthly; if nobody does, show the link only.
 */
export const EBAY_RECORD = {
  sellerName: 'ninjapon',
  feedbackScore: '9,208',
  positive: '99%',
  positivePeriod: 'last 12 months',
  itemsSold: '22K',
  asOf: 'Nov 17, 2026',
  url: 'https://www.ebay.com/usr/ninjapon',
} as const;

export const SISTER_STORES = [
  {
    name: 'Tokyo Card Vault',
    what: 'Trading cards',
    url: 'https://tokyocardvault.com',
  },
  {
    name: 'Tokyo Character Vault',
    what: 'Character goods',
    url: 'https://tokyocharactervault.com',
  },
] as const;

/** Contact for all three Vault stores (owner decision 2026-11-17). */
export const CONTACT_EMAIL = 'info@xon-corp.com';
