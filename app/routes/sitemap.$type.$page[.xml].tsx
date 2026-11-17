import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {SCOPE_QUERY, SHELVES, isOwnProduct} from '~/lib/site';

/**
 * Scoped sitemaps (same shape as Tokyo Card / Character Vault).
 *
 * Hydrogen's getSitemap() lists every product / collection / page published
 * to this storefront. Since 2026-11-17 the storefront also carries the Card
 * and Character Vault catalog (the three sites run as one Hydrogen app), so:
 * - products: products with Spin's scope tag (SCOPE_QUERY + isOwnProduct)
 * - collections: the shelf allowlist
 * Only page 1 exists; it holds up to MAX_PRODUCTS URLs (sitemap limit is
 * 50,000), far above the planned catalog size.
 */
const PAGE_SIZE = 250;
const MAX_PRODUCTS = 10_000;

export async function loader({request, params, context}: Route.LoaderArgs) {
  const {type, page} = params;
  if (page !== '1' || (type !== 'products' && type !== 'collections')) {
    throw new Response('Not found', {status: 404});
  }

  const origin = new URL(request.url).origin;
  const urls: Array<{loc: string; lastmod?: string}> =
    type === 'collections'
      ? SHELVES.map((s) => ({loc: `${origin}/collections/${s.handle}`}))
      : (await fetchAllProductHandles(context.storefront)).map((p) => ({
          loc: `${origin}/products/${p.handle}`,
          lastmod: p.updatedAt,
        }));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

async function fetchAllProductHandles(
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<Array<{handle: string; updatedAt: string}>> {
  const out: Array<{handle: string; updatedAt: string}> = [];
  let after: string | null = null;
  while (out.length < MAX_PRODUCTS) {
    const res: SitemapProductsResult = await storefront.query(
      SITEMAP_PRODUCTS_QUERY,
      {
        variables: {query: SCOPE_QUERY, first: PAGE_SIZE, after},
        cache: storefront.CacheLong(),
      },
    );
    const conn = res.products;
    out.push(...conn.nodes.filter(isOwnProduct));
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor ?? null;
  }
  return out;
}

interface SitemapProductsResult {
  products: {
    nodes: Array<{handle: string; updatedAt: string; tags: string[]}>;
    pageInfo: {hasNextPage: boolean; endCursor?: string | null};
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SITEMAP_PRODUCTS_QUERY = `#graphql
  query SitemapProducts(
    $query: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, query: $query, sortKey: ID) {
      nodes {
        handle
        updatedAt
        tags
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
