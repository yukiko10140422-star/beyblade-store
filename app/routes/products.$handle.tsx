import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const title = `${product?.title ?? ''} | Tokyo Spin Vault`;
  const description = product?.description?.substring(0, 160) ?? '';
  const image =
    product?.selectedOrFirstAvailableVariant?.image?.url ??
    product?.featuredImage?.url ??
    '';
  const price = product?.selectedOrFirstAvailableVariant?.price?.amount ?? '0';
  const currency =
    product?.selectedOrFirstAvailableVariant?.price?.currencyCode ?? 'USD';
  const available =
    product?.selectedOrFirstAvailableVariant?.availableForSale ?? false;

  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'product'},
    {property: 'og:image', content: image},
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {property: 'product:price:amount', content: price},
    {property: 'product:price:currency', content: currency},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product?.title,
        description: product?.description,
        image: image,
        brand: {
          '@type': 'Brand',
          name: product?.vendor || 'Takara Tomy',
        },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: currency,
          availability: available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Tokyo Spin Vault',
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingOrigin: {
              '@type': 'DefinedRegion',
              addressCountry: 'JP',
            },
          },
        },
      }),
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-chrome-500 text-sm flex items-center gap-2">
        <a href="/" className="hover:text-gold-400 transition-colors">
          Home
        </a>
        <span className="text-vault-600">/</span>
        <a
          href="/collections"
          className="hover:text-gold-400 transition-colors"
        >
          Collections
        </a>
        <span className="text-vault-600">/</span>
        <span className="text-chrome-300 truncate max-w-[200px]">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image */}
        <ProductImage image={selectedVariant?.image} />

        {/* Right: Product Info */}
        <div className="lg:sticky lg:top-[104px] lg:self-start space-y-6">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-chrome-500 text-xs font-heading uppercase tracking-[0.2em]">
              {product.vendor}
            </p>
          )}

          {/* Title */}
          <h1 className="font-heading text-2xl md:text-3xl text-chrome-100 uppercase tracking-wide">
            {title}
          </h1>

          {/* Price */}
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />

          {/* Divider */}
          <div className="border-t border-vault-700" />

          {/* Variant Selector + Add to Cart */}
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          {/* Duties included notice */}
          <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-gold-400/5 border border-gold-400/10">
            <svg
              className="w-4 h-4 text-gold-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-chrome-300 text-xs">
              <span className="text-gold-400 font-heading uppercase tracking-wider">
                Duties included
              </span>{' '}
              — No surprise fees at delivery
            </p>
          </div>

          {/* Shipping */}
          <div className="py-4 border-t border-vault-700 space-y-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gold-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              <div>
                <p className="text-chrome-200 text-sm">
                  Ships from Tokyo, Japan
                </p>
                <p className="text-chrome-500 text-xs">
                  Standard: 7-14 days &middot; Express (FedEx/DHL): 3-7 days
                </p>
              </div>
            </div>
            <p className="text-chrome-600 text-[10px] pl-8">
              Free express shipping on orders over $150
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-t border-vault-700">
            <div className="flex items-center gap-2 text-chrome-500 text-xs">
              <svg
                className="w-4 h-4 text-gold-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              100% Authentic
            </div>
            <div className="flex items-center gap-2 text-chrome-500 text-xs">
              <svg
                className="w-4 h-4 text-gold-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
              </svg>
              Fully Tracked
            </div>
            <div className="flex items-center gap-2 text-chrome-500 text-xs">
              <svg
                className="w-4 h-4 text-gold-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Duties Included
            </div>
          </div>

          {/* Beyblade Specs (metafields) */}
          <BeybladeSpecs product={product} />

          {/* Description */}
          <div className="border-t border-vault-700 pt-6">
            <h2 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">
              Description
            </h2>
            <div
              className="text-chrome-400 text-sm leading-relaxed [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&_a]:text-gold-400 [&_a]:underline"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    beybladeType: metafield(namespace: "beyblade", key: "type") { value }
    bladeName: metafield(namespace: "beyblade", key: "blade_name") { value }
    ratchetSpec: metafield(namespace: "beyblade", key: "ratchet_spec") { value }
    bitSpec: metafield(namespace: "beyblade", key: "bit_spec") { value }
    series: metafield(namespace: "beyblade", key: "series") { value }
    modelNumber: metafield(namespace: "beyblade", key: "model_number") { value }
    condition: metafield(namespace: "beyblade", key: "condition") { value }
    isLimitedEdition: metafield(namespace: "beyblade", key: "is_limited_edition") { value }
    generation: metafield(namespace: "beyblade", key: "generation") { value }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

function BeybladeSpecs({product}: {product: any}) {
  const specs = [
    {label: 'Type', value: product.beybladeType?.value},
    {label: 'Blade', value: product.bladeName?.value},
    {label: 'Ratchet', value: product.ratchetSpec?.value},
    {label: 'Bit', value: product.bitSpec?.value},
    {label: 'Series', value: product.series?.value},
    {label: 'Model', value: product.modelNumber?.value},
    {label: 'Condition', value: product.condition?.value},
    {label: 'Generation', value: product.generation?.value},
  ].filter((s) => s.value);

  if (specs.length === 0) return null;

  const isLimited = product.isLimitedEdition?.value === 'true';

  return (
    <div className="border-t border-vault-700 pt-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400">
          Specifications
        </h2>
        {isLimited && (
          <span className="text-[9px] font-heading uppercase tracking-widest bg-danger-500/20 text-danger-500 border border-danger-500/30 px-2 py-0.5 rounded-full">
            Limited Edition
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {specs.map((spec) => (
          <div key={spec.label}>
            <dt className="text-chrome-600 text-[10px] uppercase tracking-wider">
              {spec.label}
            </dt>
            <dd className="text-chrome-200 text-sm font-heading mt-0.5">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
