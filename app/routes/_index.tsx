import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {
  CategoryTiles,
  EbayRecord,
  FactsBand,
  HomeHero,
  ProductGridSection,
} from '~/components/home/HomeSections';
import {SITE_URL} from '~/lib/constants';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import {EXCLUDE_QUERY, SITE, isOwnProduct} from '~/lib/site';

export const meta: Route.MetaFunction = () => {
  const title = `${SITE.name} | Japanese Beyblade X shipped from Japan`;
  const description =
    'Japanese Takara Tomy Beyblade X releases: starters, boosters, stadiums and event-limited items. Every product page shows the model number and when it ships. Ships from Japan with tracking.';
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: SITE_URL},
    {property: 'og:image', content: `${SITE_URL}/images/og-home.png`},
    {property: 'og:image:width', content: '1200'},
    {property: 'og:image:height', content: '630'},
    {property: 'og:site_name', content: SITE.name},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: `${SITE_URL}/images/og-home.png`},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    },
  ];
};

export function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  // Shared Shopify store: sister-store products are excluded in the query
  // and again after it.
  const bestSellers = storefront
    .query(BEST_SELLERS_QUERY, {
      variables: {query: EXCLUDE_QUERY},
      cache: storefront.CacheShort(),
    })
    .then((res) => res.products.nodes.filter(isOwnProduct).slice(0, 8))
    .catch((error: Error) => {
      console.error(error);
      return null;
    });
  return {bestSellers};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <HomeHero />
      <ProductGridSection
        title="Best sellers"
        products={data.bestSellers}
        viewAllHref="/collections/all-beyblades"
      />
      <CategoryTiles />
      <EbayRecord />
      <FactsBand />
    </div>
  );
}

const BEST_SELLERS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_ITEM_FRAGMENT}
  query BestSellers(
    $query: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 12, sortKey: BEST_SELLING, query: $query) {
      nodes {
        ...ProductItem
      }
    }
  }
` as const;
