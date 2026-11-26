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

/**
 * Pages and blogs are store-wide in Shopify (not per sales channel), so the
 * other Vault sites' pages are visible to this storefront too. Spin shows
 * ONLY the pages / blogs listed here (allowlist, same idea as products).
 * Source: Storefront API pages / blogs, read 2026-11-18 — these are the
 * Tokyo Spin Vault pages that existed before the other two sites.
 * Add a handle here when Spin gets a new page.
 */
export const SPIN_PAGE_HANDLES: readonly string[] = [
  'contact',
  'about',
  'shipping-info',
  'faq',
  'data-sharing-opt-out',
  'legal-notice-特定商取引法に基づく表記',
];
/**
 * Blog 'ニュース' holds the 2026-04 Beyblade articles. Google sends visitors
 * to their URLs (/blogs/%E3%83%8B…/<article>), so they are served at the same
 * URLs (owner decision 2026-11-25: keep the URLs, fix the pages). It was off
 * from 2026-11-18 because its list cards collapsed (inline links, QA 11-18).
 * Handles are compared after decodeURIComponent + NFC (see normalizeHandle).
 */
/**
 * Legal notice (特定商取引法に基づく表記), a Shopify page (rewritten
 * 2026-11-26 for Merchant Center: XON株式会社, Yokohama office, phone).
 * Linked from the footer.
 */
export const LEGAL_NOTICE_PATH = '/pages/legal-notice-特定商取引法に基づく表記';
export const SPIN_BLOG_HANDLES: readonly string[] = ['ニュース'];

/**
 * Name shown for a blog. The Shopify title of 'ニュース' is Japanese; the site
 * is in English, so the page shows this label (the Shopify data is unchanged).
 */
export const SPIN_BLOG_LABELS: Readonly<Record<string, string>> = {
  ニュース: 'Beyblade Guides',
};

export function blogLabel(handle: string, fallback: string): string {
  return SPIN_BLOG_LABELS[normalizeHandle(handle)] ?? fallback;
}

/**
 * Old Shopify pages whose text predates the site (e.g. contact page with
 * support@tokyospinvault.com and "24 hours"): sent to the site's own pages,
 * which hold the current facts (contact = /contact, info@xon-corp.com).
 */
export const SPIN_PAGE_REDIRECTS: Readonly<Record<string, string>> = {
  contact: '/contact',
  about: '/about',
  'shipping-info': '/shipping',
  faq: '/faq',
};

/** URL-decoded, NFC-normalized handle (Japanese handles arrive either way). */
export function normalizeHandle(h: string | null | undefined): string {
  try {
    return decodeURIComponent(h ?? '').normalize('NFC');
  } catch {
    return (h ?? '').normalize('NFC');
  }
}
const norm = normalizeHandle;

export function isOwnPage(handle: string | null | undefined): boolean {
  return SPIN_PAGE_HANDLES.includes(norm(handle));
}

export function isOwnBlog(handle: string | null | undefined): boolean {
  return SPIN_BLOG_HANDLES.includes(norm(handle));
}

/**
 * Storefront `products(query:)` string for a shopper's search term, limited
 * to Spin products. Search & Discovery filters are off, so `productFilters`
 * on `search()` is ignored by Shopify (checked 2026-11-18: a tag filter on
 * search returned other stores' products) — the product search query is
 * used instead. Quotes / backslashes / colons in the term are dropped so the
 * term cannot change the scope. `prefix` adds `*` to the last word
 * (predictive search).
 */
export function scopedSearchQuery(term: string, prefix = false): string {
  const words = term
    .replace(/["\\:()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(AND|OR|NOT)$/i.test(w) && !w.startsWith('-'));
  // Model numbers: "bx5" / "BX 5" / "bx-5" all mean BX-5… (Takara Tomy's
  // BX / UX / CX numbering), the form product titles use.
  const merged: string[] = [];
  for (const w of words) {
    const prev = merged[merged.length - 1];
    if (prev && /^(bx|ux|cx)$/i.test(prev) && /^\d{1,3}$/.test(w)) {
      merged[merged.length - 1] = `${prev}-${w}`;
    } else {
      merged.push(w.replace(/^(bx|ux|cx)(\d{1,3})$/i, '$1-$2'));
    }
  }
  if (prefix && merged.length) merged[merged.length - 1] += '*';
  return [...merged, SCOPE_QUERY].join(' ');
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

/**
 * Google product taxonomy id 3466. Used by the product page JSON-LD and the
 * Merchant Center feed (/feeds/products.xml).
 */
export const GOOGLE_PRODUCT_CATEGORY =
  'Toys & Games > Toys > Activity Toys > Spinning Tops';

export interface Shelf {
  handle: string;
  title: string;
  short: string;
  description: string;
  wide?: boolean;
  /** Shown in the header menu (others only on home / /collections). */
  nav?: boolean;
}

/**
 * Shelves = the Shopify smart collections defined in
 * tokyo-vaults/docs/spin-taxonomy.md (2026-11-18, all tag rules). The
 * entry points (header, home, empty cart, /collections) show only the
 * shelves that have Spin products (~/lib/shelf-counts).
 * `nav`: shown in the header menu.
 */
export const SHELVES: readonly Shelf[] = [
  {
    handle: 'beyblade-x',
    title: 'Beyblade X',
    short: 'Beyblade X',
    description: 'Japanese Takara Tomy Beyblade X releases.',
    wide: true,
    nav: true,
  },
  {
    handle: 'pre-order',
    title: 'Pre-order',
    short: 'Pre-order',
    description: 'Upcoming releases. Each page shows the release date.',
    wide: true,
    nav: true,
  },
  {
    handle: 'starters',
    title: 'Starters',
    short: 'Starters',
    description: 'A Beyblade with a launcher, ready to battle.',
    nav: true,
  },
  {
    handle: 'boosters',
    title: 'Boosters',
    short: 'Boosters',
    description: 'A Beyblade on its own, without a launcher.',
    nav: true,
  },
  {
    handle: 'random-boosters',
    title: 'Random Boosters',
    short: 'Random Boosters',
    description: 'Sealed boxes with a random Beyblade inside.',
  },
  {
    handle: 'single-beys',
    title: 'Single Beyblades',
    short: 'Singles',
    description: 'One Beyblade sold on its own.',
  },
  {
    handle: 'beyblade-sets-bundles',
    title: 'Sets & Bundles',
    short: 'Sets',
    description: 'Sets and multi-item bundles.',
    nav: true,
  },
  {
    handle: 'launchers-accessories',
    title: 'Launchers',
    short: 'Launchers',
    description: 'Launchers, grips and winders.',
    nav: true,
  },
  {
    handle: 'stadiums',
    title: 'Stadiums',
    short: 'Stadiums',
    description: 'Battle stadiums.',
    nav: true,
  },
  {
    handle: 'parts-accessories',
    title: 'Parts & Accessories',
    short: 'Parts',
    description: 'Parts and other accessories.',
  },
  {
    handle: 'rare-exclusive',
    title: 'Limited',
    short: 'Limited',
    description: 'Event and campaign items with limited release.',
    nav: true,
  },
  {
    handle: 'all-beyblades',
    title: 'All products',
    short: 'All',
    description: 'Everything in the store.',
    nav: true,
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
  /**
   * Address with the postal code, for the contact page. Postal code
   * 220-0004 = 神奈川県横浜市西区北幸 (Japan Post postal code search,
   * checked 2026-11-24).
   */
  postalAddress:
    'Mutsumi Bldg. 3F, 2-10-48 Kitasaiwai, Nishi-ku, Yokohama, Kanagawa 220-0004, Japan',
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

/**
 * Representative directors as registered (commercial register
 * 履歴事項全部証明書, 04_XON/会社重要書類). Written in kanji as registered:
 * the reading of the names is not on record, so they are not romanized.
 */
export const REPRESENTATIVES = ['宮﨑 友祈子', '多田 健人'] as const;

/**
 * Customer contact phone (owner decision 2026-11-26, ops journal #1251:
 * publish on the sites and in Merchant Center; same number there).
 * display = shown, href = tel: link, schema = schema.org telephone.
 */
export const CONTACT_PHONE = {
  display: '+81 80-2071-8587',
  href: 'tel:+818020718587',
  schema: '+81-80-2071-8587',
} as const;
