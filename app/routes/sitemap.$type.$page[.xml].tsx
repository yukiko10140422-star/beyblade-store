import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {
  SCOPE_QUERY,
  SHELVES,
  SPIN_BLOG_HANDLES,
  SPIN_PAGE_HANDLES,
  SPIN_PAGE_REDIRECTS,
  isOwnProduct,
} from '~/lib/site';

/**
 * Scoped sitemaps (same shape as Tokyo Card / Character Vault).
 *
 * Hydrogen's getSitemap() lists every product / collection / page published
 * to this storefront. Since 2026-11-17 the storefront also carries the Card
 * and Character Vault catalog (the three sites run as one Hydrogen app), so:
 * - products: products with Spin's scope tag (SCOPE_QUERY + isOwnProduct)
 * - collections: the shelf allowlist
 * - pages: the site's own info routes + allowlisted Shopify pages that are
 *   not redirected (SPIN_PAGE_REDIRECTS sends 4 of them to the info routes)
 * - blogs: each allowlisted blog and all its articles (read to the last page)
 * Only page 1 exists; it holds up to MAX_PRODUCTS URLs (sitemap limit is
 * 50,000), far above the planned catalog size.
 */
const PAGE_SIZE = 250;
const MAX_PRODUCTS = 10_000;
const MAX_ARTICLES = 5_000;
const SITEMAP_TYPES = ['products', 'collections', 'pages', 'blogs'] as const;
type SitemapType = (typeof SITEMAP_TYPES)[number];

/** The site's own info pages (app/routes/*.tsx), not Shopify pages. */
const INFO_ROUTES = ['/about', '/shipping', '/returns', '/faq', '/contact'];

type SitemapUrl = {loc: string; lastmod?: string};

export async function loader({request, params, context}: Route.LoaderArgs) {
  const {type, page} = params;
  if (page !== '1' || !SITEMAP_TYPES.includes(type as SitemapType)) {
    throw new Response('Not found', {status: 404});
  }

  const origin = new URL(request.url).origin;
  const urls = await sitemapUrls(type as SitemapType, origin, context.storefront);

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

async function sitemapUrls(
  type: SitemapType,
  origin: string,
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<SitemapUrl[]> {
  switch (type) {
    case 'collections':
      return SHELVES.map((s) => ({loc: `${origin}/collections/${s.handle}`}));
    case 'pages':
      return [
        ...INFO_ROUTES.map((r) => ({loc: `${origin}${r}`})),
        ...SPIN_PAGE_HANDLES.filter((h) => !SPIN_PAGE_REDIRECTS[h]).map(
          (h) => ({loc: `${origin}/pages/${encodeURIComponent(h)}`}),
        ),
      ];
    case 'blogs':
      return fetchBlogUrls(storefront, origin);
    case 'products':
      return (await fetchAllProductHandles(storefront)).map((p) => ({
        loc: `${origin}/products/${p.handle}`,
        lastmod: p.updatedAt,
      }));
  }
}

/** Each allowlisted blog, then every article in it (to the last page). */
async function fetchBlogUrls(
  storefront: Route.LoaderArgs['context']['storefront'],
  origin: string,
): Promise<SitemapUrl[]> {
  const out: SitemapUrl[] = [];
  for (const blogHandle of SPIN_BLOG_HANDLES) {
    const base = `${origin}/blogs/${encodeURIComponent(blogHandle)}`;
    const articles: SitemapUrl[] = [];
    let after: string | null = null;
    let found = false;
    while (articles.length < MAX_ARTICLES) {
      const res: SitemapArticlesResult = await storefront.query(
        SITEMAP_ARTICLES_QUERY,
        {
          variables: {blogHandle, first: PAGE_SIZE, after},
          cache: storefront.CacheLong(),
        },
      );
      const conn = res.blog?.articles;
      if (!conn) break;
      found = true;
      articles.push(
        ...conn.nodes.map((a) => ({
          loc: `${base}/${encodeURIComponent(a.handle)}`,
          lastmod: a.publishedAt,
        })),
      );
      if (!conn.pageInfo.hasNextPage) break;
      after = conn.pageInfo.endCursor ?? null;
    }
    if (found) out.push({loc: base}, ...articles);
  }
  return out;
}

interface SitemapArticlesResult {
  blog: {
    articles: {
      nodes: Array<{handle: string; publishedAt: string}>;
      pageInfo: {hasNextPage: boolean; endCursor?: string | null};
    };
  } | null;
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

const SITEMAP_ARTICLES_QUERY = `#graphql
  query SitemapArticles(
    $blogHandle: String!
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      articles(first: $first, after: $after, sortKey: ID) {
        nodes {
          handle
          publishedAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
` as const;
