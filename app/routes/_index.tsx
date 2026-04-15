import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {HeroSection} from '~/components/home/HeroSection';
import {FeaturedHero} from '~/components/home/FeaturedHero';
import {NewArrivals} from '~/components/home/NewArrivals';
import {TypeCategories} from '~/components/home/TypeCategories';
import {TrustSignals} from '~/components/home/TrustSignals';
import {VaultExclusives} from '~/components/home/VaultExclusives';
import {ShippingBanner} from '~/components/home/ShippingBanner';
import {Newsletter} from '~/components/home/Newsletter';
import {SITE_URL} from '~/lib/constants';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';

export const meta: Route.MetaFunction = () => {
  const title = 'Tokyo Spin Vault | Authentic Beyblades from Japan';
  const description =
    'Premium authentic Beyblades sourced direct from Japan. Rare finds, exclusive drops, collector grade. Ships worldwide from Tokyo.';
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: SITE_URL},
    {property: 'og:image', content: `${SITE_URL}/images/logo.png`},
    {property: 'og:image:width', content: '400'},
    {property: 'og:image:height', content: '400'},
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: `${SITE_URL}/images/logo.png`},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Tokyo Spin Vault',
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Tokyo Spin Vault',
        description,
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        sameAs: [
          'https://www.instagram.com/tsv_2026',
          'https://www.tiktok.com/@tokyo.spin.vault',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@tokyospinvault.com',
          contactType: 'customer service',
        },
      },
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <HeroSection />
      <FeaturedHero />
      <NewArrivals products={data.recommendedProducts} />
      <TypeCategories />
      <TrustSignals />
      <VaultExclusives products={data.recommendedProducts} />
      <ShippingBanner />
      <Newsletter />
    </div>
  );
}

/* --- GraphQL --- */
const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_ITEM_FRAGMENT}
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductItem
      }
    }
  }
` as const;
