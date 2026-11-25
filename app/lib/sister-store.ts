/**
 * The three Vault sites share one Shopify store, so a product handle can be
 * requested on the wrong site — most often from Shopify Catalog (ChatGPT's
 * product cards link to the myshopify address, which the Online Store's
 * redirect theme forwards to tokyospinvault.com with the same path).
 *
 * When this site does not serve a product but a sister site does, send the
 * visitor to the same product page there with a 301 (query string kept, so
 * utm_* attribution survives). Each rule below is the same test the sister
 * site uses to decide what it serves (site.ts of each store), so the target
 * never answers with another redirect back.
 */
export type VaultStore = 'spin' | 'card' | 'character';

export const STORE_ORIGINS: Readonly<Record<VaultStore, string>> = {
  spin: 'https://tokyospinvault.com',
  card: 'https://tokyocardvault.com',
  character: 'https://tokyocharactervault.com',
};

const SPIN_EXCLUDED = [
  'card-vault',
  'character-vault',
  'store:tokyo-card-vault',
  'store:tokyo-character-vault',
];

/** Which site serves a product with these tags (null = none of them). */
export function storeServing(
  rawTags: readonly string[] | null | undefined,
): VaultStore | null {
  const tags = (rawTags ?? []).map((t) => t.trim().toLowerCase());
  if (tags.includes('card-vault')) return 'card';
  if (tags.includes('character-vault')) return 'character';
  if (
    tags.includes('store:tokyo-spin-vault') &&
    !tags.some((t) => SPIN_EXCLUDED.includes(t))
  ) {
    return 'spin';
  }
  return null;
}

/**
 * 301 to the sister site's product page, or null when the product belongs to
 * this site or to no site (the caller then answers 404 as before).
 */
export function sisterProductRedirect(
  product: {handle: string; tags?: readonly string[] | null} | null | undefined,
  request: Request,
  self: VaultStore,
): Response | null {
  if (!product?.handle) return null;
  const target = storeServing(product.tags);
  if (!target || target === self) return null;
  const {search} = new URL(request.url);
  const location = `${STORE_ORIGINS[target]}/products/${encodeURIComponent(product.handle)}${search}`;
  return new Response(null, {
    status: 301,
    headers: {Location: location, 'Cache-Control': 'public, max-age=3600'},
  });
}
