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
import {BEY_TYPES, TYPE_CONFIG, isBeyType} from '~/lib/beyblade-types';
import {SITE_URL} from '~/lib/constants';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import type {ProductItemFragment} from 'storefrontapi.generated';
import clsx from 'clsx';

export const meta: Route.MetaFunction = ({data}) => {
  const title = `${data?.collection.title ?? ''} | Tokyo Spin Vault`;
  const description =
    data?.collection.description ||
    `Browse ${data?.collection.title} at Tokyo Spin Vault. Authentic Beyblades from Japan.`;
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
      content: `${SITE_URL}/images/logo.png`,
    },
    {property: 'og:image:width', content: '400'},
    {property: 'og:image:height', content: '400'},
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
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

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        sortKey: sortOption.key,
        reverse: sortOption.reverse,
        filters: filters.length > 0 ? filters : undefined,
        ...paginationVariables,
      },
      cache: storefront.CacheShort(),
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          {label: 'Home', href: '/'},
          {label: 'Collections', href: '/collections'},
          {label: collection.title},
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl text-gold-metallic uppercase tracking-wider">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-chrome-400 text-sm mt-3 max-w-2xl">
            {collection.description}
          </p>
        )}
      </div>

      {/* Filter + Sort Bar */}
      <FilterBar />

      {/* Product Grid */}
      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        resourcesClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
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
    navigate(`?${params.toString()}`, {preventScrollReset: true});
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-vault-700">
      {/* Type Filter Chips */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter by type"
      >
        <span className="text-chrome-500 text-xs font-heading uppercase tracking-wider mr-1">
          Type
        </span>
        <button
          aria-pressed={!activeType}
          onClick={() => setParam('type', null)}
          className={clsx(
            'text-[10px] font-heading uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all',
            !activeType
              ? 'border-gold-400/40 bg-gold-400/10 text-gold-400'
              : 'border-vault-600 text-chrome-500 hover:border-vault-500 hover:text-chrome-300',
          )}
        >
          All
        </button>
        {BEY_TYPES.map((type) => {
          const isActive = activeType === type;
          const cfg = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              aria-pressed={isActive}
              onClick={() => setParam('type', isActive ? null : type)}
              className={clsx(
                'text-[10px] font-heading uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all',
                isActive
                  ? `${cfg.border} ${cfg.bg} ${cfg.text}`
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
          className="text-chrome-500 text-xs font-heading uppercase tracking-wider"
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
          className="bg-vault-800 border border-vault-600 rounded-lg px-3 py-1.5 text-xs text-chrome-300 font-heading uppercase tracking-wider focus:outline-none focus:border-gold-400/50 transition-colors cursor-pointer"
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
