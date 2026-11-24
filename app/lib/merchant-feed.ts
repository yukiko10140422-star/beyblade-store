/**
 * Google Merchant Center product feed (RSS 2.0 + g: namespace).
 *
 * The same file is kept in each Vault store's repo (spin / card / character;
 * the stores are separate repos, so nothing is imported across them). The
 * route `app/routes/feeds.products[.xml].tsx` of each store reads its own
 * products (scoped with ~/lib/site) and passes them here in the neutral
 * `FeedProduct` shape. Store-specific rules (condition, category, origin)
 * are decided in the route, using the same helpers as the product page.
 *
 * Rules (FM10): only facts carried by the product data are written. Nothing
 * is invented — no MPN, no availability_date without a date, no brand for
 * "Unbranded".
 * Spec: https://support.google.com/merchants/answer/7052112
 */

export interface FeedVariant {
  /** Storefront GID, e.g. gid://shopify/ProductVariant/123. */
  id: string;
  title: string;
  availableForSale: boolean;
  barcode?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  price: {amount: string; currencyCode: string};
  compareAtPrice?: {amount: string; currencyCode: string} | null;
  selectedOptions: Array<{name: string; value: string}>;
  image?: {url: string} | null;
}

export interface FeedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  images: string[];
  variants: FeedVariant[];
  /** Same test as the product page (`pre-order` tag). */
  preOrder: boolean;
  /** `custom.expected_ship_date` (YYYY-MM-DD), when set. */
  expectedShipDate?: string | null;
  condition: 'new' | 'used';
  googleProductCategory?: string;
}

export interface FeedChannel {
  title: string;
  /** Production origin, e.g. https://tokyospinvault.com (no trailing /). */
  origin: string;
  description: string;
}

const MAX_TITLE = 150;
const MAX_DESCRIPTION = 5000;
const MAX_ADDITIONAL_IMAGES = 10;
const GTIN = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/;
const NO_BRAND = new Set(['', 'unbranded', 'no brand', 'none', 'n/a']);
const WEIGHT_UNITS: Record<string, string> = {
  GRAMS: 'g',
  KILOGRAMS: 'kg',
  POUNDS: 'lb',
  OUNCES: 'oz',
};

/** The number at the end of a Shopify GID (stable id for g:id). */
export function gidNumber(gid: string): string {
  return gid.slice(gid.lastIndexOf('/') + 1);
}

export function buildFeedXml(
  channel: FeedChannel,
  products: readonly FeedProduct[],
): string {
  const items = products.flatMap((p) =>
    p.variants.map((v) => buildItem(channel, p, v)),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    tag('title', channel.title),
    tag('link', channel.origin),
    tag('description', channel.description),
    ...items,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}

/** Number of <item>s buildFeedXml writes (one per variant). */
export function countFeedItems(products: readonly FeedProduct[]): number {
  return products.reduce((n, p) => n + p.variants.length, 0);
}

function buildItem(
  channel: FeedChannel,
  p: FeedProduct,
  v: FeedVariant,
): string {
  const multi = p.variants.length > 1;
  const link = productLink(channel.origin, p.handle, multi ? v : null);
  const main = https(multi && v.image?.url ? v.image.url : p.images[0]);
  const additional = p.images
    .map(https)
    .filter((u): u is string => Boolean(u) && u !== main)
    .slice(0, MAX_ADDITIONAL_IMAGES);
  const variantTitle =
    multi && v.title && v.title !== 'Default Title' ? ` - ${v.title}` : '';
  const title = clip(`${p.title}${variantTitle}`, MAX_TITLE);
  const description = clip(
    plainText(p.description) || p.title,
    MAX_DESCRIPTION,
  );

  const {price, salePrice} = prices(v);
  const availability = !v.availableForSale
    ? 'out_of_stock'
    : p.preOrder
      ? 'preorder'
      : 'in_stock';
  const availabilityDate =
    availability === 'preorder' ? isoDate(p.expectedShipDate) : undefined;
  const barcode = (v.barcode ?? '').trim();
  const gtin = GTIN.test(barcode) ? barcode : undefined;
  const brand = NO_BRAND.has(p.vendor.trim().toLowerCase())
    ? undefined
    : p.vendor.trim();
  const unit = WEIGHT_UNITS[v.weightUnit ?? ''];
  const weight =
    v.weight && v.weight > 0 && unit ? `${trimNumber(v.weight)} ${unit}` : '';

  const lines = [
    tag('g:id', gidNumber(v.id)),
    multi ? tag('g:item_group_id', gidNumber(p.id)) : '',
    tag('title', title),
    tag('description', description),
    tag('link', link),
    main ? tag('g:image_link', main) : '',
    ...additional.map((u) => tag('g:additional_image_link', u)),
    tag('g:availability', availability),
    availabilityDate ? tag('g:availability_date', availabilityDate) : '',
    tag('g:price', price),
    salePrice ? tag('g:sale_price', salePrice) : '',
    tag('g:condition', p.condition),
    brand ? tag('g:brand', brand) : '',
    gtin ? tag('g:gtin', gtin) : tag('g:identifier_exists', 'no'),
    p.googleProductCategory
      ? tag('g:google_product_category', p.googleProductCategory)
      : '',
    weight ? tag('g:shipping_weight', weight) : '',
  ].filter(Boolean);
  return `<item>\n  ${lines.join('\n  ')}\n</item>`;
}

/**
 * Product page URL on the production domain. A variant of a multi-variant
 * product is linked with its selected options (`?Color=Red`), which is what
 * the product page reads (getSelectedProductOptions) — `?variant=<id>` is
 * not read by the page.
 */
function productLink(
  origin: string,
  handle: string,
  variant: FeedVariant | null,
): string {
  const url = `${origin}/products/${encodeURIComponent(handle)}`;
  if (!variant || !variant.selectedOptions.length) return url;
  const qs = new URLSearchParams(
    variant.selectedOptions.map((o) => [o.name, o.value]),
  );
  return `${url}?${qs.toString()}`;
}

/** compareAt above price: price = compareAt, sale_price = price. */
function prices(v: FeedVariant): {price: string; salePrice?: string} {
  const now = money(v.price.amount, v.price.currencyCode);
  const was = v.compareAtPrice;
  if (
    was &&
    was.currencyCode === v.price.currencyCode &&
    Number(was.amount) > Number(v.price.amount)
  ) {
    return {price: money(was.amount, was.currencyCode), salePrice: now};
  }
  return {price: now};
}

function money(amount: string, currency: string): string {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

/** YYYY-MM-DD → ISO 8601 at 00:00 Japan time; anything else → undefined. */
function isoDate(d: string | null | undefined): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((d ?? '').trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}T00:00+09:00` : undefined;
}

function https(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://')) return `https://${url.slice(7)}`;
  return url.startsWith('https://') ? url : undefined;
}

function plainText(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(s: string, max: number): string {
  const chars = Array.from(s);
  return chars.length <= max ? s : `${chars.slice(0, max - 1).join('')}…`;
}

function trimNumber(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}

function tag(name: string, value: string): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

// Characters not allowed in XML 1.0 are dropped; & < > " ' are escaped.
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

function escapeXml(s: string): string {
  return s
    .replace(INVALID_XML, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
