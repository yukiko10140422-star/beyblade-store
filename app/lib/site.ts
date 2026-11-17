/**
 * Tokyo Spin Vault — site identity, shelves, store scoping and public facts.
 * Every fact shown to shoppers lives here or in ~/lib/shipping, with its
 * source, so it can be reviewed in one place.
 *
 * The Shopify store is shared with Tokyo Card Vault and Tokyo Character
 * Vault. Their products carry the tags below and must never appear here.
 */

export const SITE = {
  name: 'Tokyo Spin Vault',
  shortName: 'Spin Vault',
} as const;

/** Tags of the sister stores' products (shared Shopify store). */
export const EXCLUDED_TAGS = ['card-vault', 'character-vault'] as const;

/** Storefront search query suffix that removes sister-store products. */
export const EXCLUDE_QUERY = EXCLUDED_TAGS.map((t) => `-tag:${t}`).join(' ');

/**
 * True unless the product carries a sister-store tag. Tags are compared
 * case-insensitively and trimmed so "Card-Vault " is caught too.
 * NOTE: this is a block-list (Spin predates the shared store). A sister
 * product that is published to the Spin channel WITHOUT its tag would still
 * show — the import must always tag sister products (docs).
 */
export function isOwnProduct(p: {tags?: readonly string[] | null}): boolean {
  return !(p.tags ?? []).some((t) =>
    (EXCLUDED_TAGS as readonly string[]).includes(t.trim().toLowerCase()),
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
