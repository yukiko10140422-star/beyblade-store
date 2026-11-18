import {
  redirect,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {BEY_TYPES, isBeyType} from '~/lib/beyblade-types';
import {SITE_URL} from '~/lib/constants';
import {SHELVES, SITE, isOwnProduct} from '~/lib/site';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import type {ProductItemFragment} from 'storefrontapi.generated';
import clsx from 'clsx';

export const meta: Route.MetaFunction = ({data}) => {
  const title = `${data?.collection.title ?? ''} | ${SITE.name}`;
  const description =
    data?.collection.description ||
    `Browse ${data?.collection.title} at ${SITE.name}. Japanese Beyblade X, shipped from Japan.`;
  const collectionUrl = `${SITE_URL}/collections/${data?.collection.handle ?? ''}`;
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: collectionUrl},
    {
      property: 'og:image',
      content: `${SITE_URL}/images/og-home.png`,
    },
    {property: 'og:image:width', content: '1200'},
    {property: 'og:image:height', content: '630'},
    {property: 'og:site_name', content: SITE.name},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Collections',
                item: `${SITE_URL}/collections`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: data?.collection.title ?? 'Collection',
              },
            ],
          },
          {
            '@type': 'CollectionPage',
            name: data?.collection.title,
            description:
              data?.collection.description ||
              `Browse ${data?.collection.title} at ${SITE.name}.`,
            url: collectionUrl,
            isPartOf: {
              '@type': 'WebSite',
              name: SITE.name,
              url: SITE_URL,
            },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: (data?.collection.products.nodes ?? [])
                .slice(0, 12)
                .map(
                  (
                    product: {handle: string; title: string},
                    index: number,
                  ) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: product.title,
                    url: `${SITE_URL}/products/${product.handle}`,
                  }),
                ),
            },
          },
        ],
      },
    },
  ];
};

const SORT_OPTIONS = [
  {label: 'Featured', key: 'COLLECTION_DEFAULT', reverse: false},
  {label: 'Price: Low → High', key: 'PRICE', reverse: false},
  {label: 'Price: High → Low', key: 'PRICE', reverse: true},
  {label: 'Newest', key: 'CREATED', reverse: true},
  {label: 'Best Selling', key: 'BEST_SELLING', reverse: false},
  {label: 'A → Z', key: 'TITLE', reverse: false},
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

function parseSortParam(sort: string | null): SortOption {
  if (!sort) return SORT_OPTIONS[0];
  const found = SORT_OPTIONS.find(
    (o) => `${o.key}-${o.reverse ? 'desc' : 'asc'}` === sort,
  );
  return found ?? SORT_OPTIONS[0];
}

function sortToParam(option: SortOption): string {
  return `${option.key}-${option.reverse ? 'desc' : 'asc'}`;
}

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) {
    throw redirect('/collections');
  }

  // Shared storefront (3 Vault sites): only Spin's own shelves are served.
  if (!SHELVES.some((s) => s.handle === handle)) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  const url = new URL(request.url);
  const sortParam = url.searchParams.get('sort');
  const typeParam = url.searchParams.get('type');

  const sortOption = parseSortParam(sortParam);

  const filters: Array<Record<string, unknown>> = [];
  if (typeParam && isBeyType(typeParam)) {
    filters.push({
      productMetafield: {
        namespace: 'beyblade',
        key: 'type',
        value: typeParam,
      },
    });
  }

  // Shared storefront: the shelf collection can also hold products of the
  // other Vault sites, and Shopify ignores product filters here (Search &
  // Discovery filters are off). So the shelf is read in full on the server,
  // narrowed to Spin products, and paged here — page size and "more" are
  // counted on Spin products only (not 12 mixed products filtered down).
  const all: ProductItemFragment[] = [];
  let collection: ShelfCollection | null = null;
  let after: string | null = null;
  for (let i = 0; i < MAX_SHELF_PAGES; i++) {
    const res: {collection: ShelfQueryCollection | null} =
      await storefront.query(COLLECTION_QUERY, {
        variables: {
          handle,
          sortKey: sortOption.key,
          reverse: sortOption.reverse,
          filters: filters.length > 0 ? filters : undefined,
          first: 250,
          endCursor: after,
        },
        cache: storefront.CacheShort(),
      });
    if (!res.collection) break;
    collection ??= res.collection;
    all.push(...res.collection.products.nodes.filter(isOwnProduct));
    if (!res.collection.products.pageInfo.hasNextPage) break;
    after = res.collection.products.pageInfo.endCursor ?? null;
  }

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection: {
      ...collection,
      products: pageOf(all, paginationVariables),
    },
  };
}

const MAX_SHELF_PAGES = 8; // 2,000 products per shelf, far above the catalog
const PAGE_BY = 12;

type ShelfQueryCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  products: {
    nodes: ProductItemFragment[];
    pageInfo: {hasNextPage: boolean; endCursor?: string | null};
  };
};
type ShelfCollection = Omit<ShelfQueryCollection, 'products'>;

/**
 * One page of the Spin-only list, in the connection shape Hydrogen's
 * <Pagination> expects. Cursors are offsets ("o24").
 */
function pageOf(
  list: ProductItemFragment[],
  vars: ReturnType<typeof getPaginationVariables>,
) {
  const offset = (c: unknown) => {
    const m = /^o(\d+)$/.exec(typeof c === 'string' ? c : '');
    return m ? Number(m[1]) : null;
  };
  let start = 0;
  if ('endCursor' in vars && offset(vars.endCursor) !== null) {
    start = offset(vars.endCursor)!;
  } else if ('startCursor' in vars && offset(vars.startCursor) !== null) {
    start = Math.max(0, offset(vars.startCursor)! - PAGE_BY);
  }
  start = Math.min(start, list.length);
  const end = Math.min(start + PAGE_BY, list.length);
  return {
    nodes: list.slice(start, end),
    pageInfo: {
      hasPreviousPage: start > 0,
      hasNextPage: end < list.length,
      startCursor: `o${start}`,
      endCursor: `o${end}`,
    },
  };
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const shelfInfo = SHELVES.find((sh) => sh.handle === collection.handle);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-[18px] md:px-10">
      <Breadcrumbs
        className="mb-4 md:mb-6"
        items={[{label: 'Home', href: '/'}, {label: collection.title}]}
      />

      <div className="mb-4 md:mb-6">
        <h1 className="m-0 text-[22px] font-bold text-chrome-200 md:text-[28px]">
          {collection.title}
        </h1>
        {(collection.description || shelfInfo?.description) && (
          <p className="mb-0 mt-2 max-w-2xl text-sm">
            {collection.description || shelfInfo?.description}
          </p>
        )}
      </div>

      {/* Filter + Sort Bar */}
      <FilterBar />

      {/* Product Grid */}
      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        resourcesClassName="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
      >
        {({node: product, index}) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : 'lazy'}
          />
        )}
      </PaginatedResourceSection>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function FilterBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeType = searchParams.get('type');
  const activeSort = searchParams.get('sort');

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('cursor');
    params.delete('direction');
    void navigate(`?${params.toString()}`, {preventScrollReset: true});
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-vault-700">
      {/* Type Filter Chips */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter by type"
      >
        <span className="text-chrome-500 text-xs font-heading mr-1">Type</span>
        <button
          aria-pressed={!activeType}
          onClick={() => setParam('type', null)}
          className={clsx(
            'text-[10px] font-heading px-3 py-1.5 rounded-[4px] border transition-all',
            !activeType
              ? 'border-silver-400/40 bg-silver-400/10 text-silver-400'
              : 'border-vault-600 text-chrome-500 hover:border-vault-500 hover:text-chrome-300',
          )}
        >
          All
        </button>
        {BEY_TYPES.map((type) => {
          const isActive = activeType === type;
          return (
            <button
              key={type}
              aria-pressed={isActive}
              onClick={() => setParam('type', isActive ? null : type)}
              className={clsx(
                'text-[10px] font-heading px-3 py-1.5 rounded-[4px] border transition-all',
                isActive
                  ? 'border-holo-500 bg-holo-50 text-holo-600'
                  : 'border-vault-600 text-chrome-500 hover:border-vault-500 hover:text-chrome-300',
              )}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="collection-sort"
          className="text-chrome-500 text-xs font-heading"
        >
          Sort
        </label>
        <select
          id="collection-sort"
          value={activeSort || sortToParam(SORT_OPTIONS[0])}
          onChange={(e) => {
            const val = e.target.value;
            setParam('sort', val === sortToParam(SORT_OPTIONS[0]) ? null : val);
          }}
          className="bg-vault-800 border border-vault-600 rounded-[4px] px-3 py-1.5 text-xs text-chrome-300 font-heading focus:outline-none focus:border-silver-400/50 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={sortToParam(option)} value={sortToParam(option)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
