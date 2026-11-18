import {isOwnProduct} from '~/lib/site';
import type {Storefront} from '@shopify/hydrogen';

/**
 * Cart guard for the shared storefront (3 Vault sites, one Storefront API
 * token): a cart on this site may only hold this site's products. Used by
 * /cart (LinesAdd) and /cart/<variant>:<qty> so a hand-made URL or form
 * cannot put another Vault site's product into this site's cart.
 */
const OWN_LINE_VARIANTS_QUERY = `#graphql
  query OwnLineVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        product {
          tags
        }
      }
    }
  }
` as const;

export async function keepOwnLines<T extends {merchandiseId: string}>(
  storefront: Storefront,
  lines: T[],
): Promise<T[]> {
  if (!lines.length) return lines;
  const ids = [...new Set(lines.map((l) => l.merchandiseId))];
  const res = await storefront.query(OWN_LINE_VARIANTS_QUERY, {
    variables: {ids},
    cache: storefront.CacheShort(),
  });
  const own = new Set(
    (res.nodes ?? [])
      .flatMap((n) => (n && 'product' in n && n.product ? [n] : []))
      .filter((n) => isOwnProduct(n.product))
      .map((n) => n.id),
  );
  return lines.filter((l) => own.has(l.merchandiseId));
}
