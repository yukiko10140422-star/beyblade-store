import type {Route} from './+types/feeds.products[.xml]';
import {SITE_URL} from '~/lib/constants';
import {
  GOOGLE_PRODUCT_CATEGORY,
  SCOPE_QUERY,
  SITE,
  isOwnProduct,
} from '~/lib/site';
import {getItemCondition} from '~/lib/bey-attributes';
import {
  buildFeedXml,
  countFeedItems,
  type FeedProduct,
  type FeedVariant,
} from '~/lib/merchant-feed';

/**
 * Google Merchant Center feed: /feeds/products.xml
 *
 * Every Spin product (SCOPE_QUERY + isOwnProduct, the same test as the
 * product page's 404), read page by page to the last page. If the list
 * cannot be read completely the route answers 503 instead of a partial feed.
 * Prices are always the US / USD context (no $country variable, so Hydrogen
 * does not swap in the visitor's country).
 */
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export async function loader({context}: Route.LoaderArgs) {
  let products: FeedProduct[];
  try {
    products = await fetchAllFeedProducts(context.storefront);
  } catch {
    return new Response('Feed temporarily unavailable', {
      status: 503,
      headers: {'Cache-Control': 'no-store', 'Retry-After': '300'},
    });
  }
  const body = buildFeedXml(
    {
      title: SITE.name,
      origin: SITE_URL,
      description: 'Japanese Beyblade from Tokyo Spin Vault.',
    },
    products,
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
      'X-Feed-Items': String(countFeedItems(products)),
    },
  });
}

async function fetchAllFeedProducts(
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<FeedProduct[]> {
  const out: FeedProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res: FeedProductsResult = await storefront.query(
      FEED_PRODUCTS_QUERY,
      {
        variables: {query: SCOPE_QUERY, first: PAGE_SIZE, after},
        cache: storefront.CacheShort(),
      },
    );
    if (res.errors?.length || !res.products) {
      throw new Error('Storefront products query failed');
    }
    const conn = res.products;
    for (const p of conn.nodes) {
      if (!isOwnProduct(p)) continue;
      if (p.variants.pageInfo.hasNextPage) {
        throw new Error(`More than ${PAGE_SIZE} variants: ${p.handle}`);
      }
      out.push(toFeedProduct(p));
    }
    if (!conn.pageInfo.hasNextPage) return out;
    after = conn.pageInfo.endCursor ?? null;
    if (!after) break;
  }
  // Not at the last page: never serve a partial list as the full catalog.
  throw new Error('Product list not read to the last page');
}

function toFeedProduct(p: FeedProductNode): FeedProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    vendor: p.vendor,
    images: p.images.nodes.map((i) => i.url),
    variants: p.variants.nodes,
    preOrder: p.tags.some((t) => t.toLowerCase() === 'pre-order'),
    expectedShipDate: p.expectedShipDate?.value ?? null,
    // Same source as the product page (beyblade.condition, else
    // ebay.condition). Not stated → left out of the feed (merchant-feed.ts).
    condition: getItemCondition(p)?.og,
    googleProductCategory: GOOGLE_PRODUCT_CATEGORY,
  };
}

interface FeedProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  images: {nodes: Array<{url: string}>};
  variants: {
    nodes: FeedVariant[];
    pageInfo: {hasNextPage: boolean};
  };
  expectedShipDate?: {value: string} | null;
  condition?: {value: string} | null;
  ebayCondition?: {value: string} | null;
}

interface FeedProductsResult {
  errors?: unknown[];
  products?: {
    nodes: FeedProductNode[];
    pageInfo: {hasNextPage: boolean; endCursor?: string | null};
  } | null;
}

const FEED_PRODUCTS_QUERY = `#graphql
  query FeedProducts($query: String!, $first: Int!, $after: String)
  @inContext(country: US, language: EN) {
    products(first: $first, after: $after, query: $query, sortKey: ID) {
      nodes {
        id
        handle
        title
        description
        vendor
        tags
        images(first: 11) {
          nodes {
            url
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            barcode
            weight
            weightUnit
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
            }
          }
          pageInfo {
            hasNextPage
          }
        }
        expectedShipDate: metafield(namespace: "custom", key: "expected_ship_date") {
          value
        }
        condition: metafield(namespace: "beyblade", key: "condition") {
          value
        }
        ebayCondition: metafield(namespace: "ebay", key: "condition") {
          value
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
