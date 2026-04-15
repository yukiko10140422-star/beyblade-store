import {Await, redirect, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import type {RelatedProductsQuery} from 'storefrontapi.generated';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductCard} from '~/components/ProductCard';
import {ProductCardSkeleton} from '~/components/home/ProductCardSkeleton';
import {TypeBadge} from '~/components/TypeBadge';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import {SITE_URL} from '~/lib/constants';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const rawTitle = product?.title ?? '';
  const title =
    rawTitle.length > 50
      ? `${rawTitle.substring(0, 50).trim()} | TSV`
      : `${rawTitle} | Tokyo Spin Vault`;
  // Build a clean meta description: title + price + key selling points.
  // Keep under 160 chars for optimal Google display.
  const description = buildProductMetaDescription({
    title: rawTitle,
    price: product?.selectedOrFirstAvailableVariant?.price?.amount,
    currency: product?.selectedOrFirstAvailableVariant?.price?.currencyCode,
    available: product?.selectedOrFirstAvailableVariant?.availableForSale,
    beybladeType: product?.beybladeType?.value,
  });
  const variantImage = product?.selectedOrFirstAvailableVariant?.image;
  const featuredImage = product?.featuredImage;
  const image = variantImage?.url ?? featuredImage?.url ?? '';
  const imageWidth = variantImage?.width ?? featuredImage?.width;
  const imageHeight = variantImage?.height ?? featuredImage?.height;
  const productUrl = `${SITE_URL}/products/${product?.handle ?? ''}`;
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
    {property: 'og:url', content: productUrl},
    {property: 'og:image', content: image},
    ...(imageWidth
      ? [{property: 'og:image:width', content: String(imageWidth)}]
      : []),
    ...(imageHeight
      ? [{property: 'og:image:height', content: String(imageHeight)}]
      : []),
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {property: 'product:price:amount', content: price},
    {property: 'product:price:currency', content: currency},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product?.title,
        description: product?.description,
        image: image,
        sku: product?.selectedOrFirstAvailableVariant?.sku || undefined,
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
      },
    },
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
            name: rawTitle,
          },
        ],
      },
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Start loading related products (deferred — does not block initial render)
  const deferredData = loadDeferredData({
    ...args,
    productId: criticalData.product.id,
  });

  return {...criticalData, ...deferredData};
}

/**
 * Load data that can be deferred (streams after initial render).
 * Related products are non-critical — the PDP is usable without them.
 */
function loadDeferredData({
  context,
  productId,
}: Route.LoaderArgs & {productId: string}) {
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {productId},
      cache: context.storefront.CacheShort(),
    })
    .catch((error: unknown) => {
      console.error('Related products query failed:', error);
      return null;
    });

  return {relatedProducts};
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
      cache: storefront.CacheShort(),
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

export default function Product() {
  const {product, relatedProducts} = useLoaderData<typeof loader>();

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
      <Breadcrumbs
        className="mb-8"
        truncateLast
        items={[
          {label: 'Home', href: '/'},
          {label: 'Collections', href: '/collections'},
          {label: title},
        ]}
      />

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

          {/* Type + Title */}
          <TypeBadge type={product.beybladeType?.value} size="md" />
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

          {/* Shipping & Duties Notice */}
          <div className="py-3 px-4 rounded-lg bg-gold-400/5 border border-gold-400/10 space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gold-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-chrome-200 text-sm">
                <span className="text-gold-400 font-heading uppercase tracking-wider">
                  Free shipping & duties included
                </span>
              </p>
            </div>
            <p className="text-chrome-400 text-xs pl-6">
              Ships from Tokyo via ePacket Light (7-14 days). All import taxes
              and customs fees are included in the price &mdash; no extra
              charges at delivery.
            </p>
          </div>

          {/* Express Upgrade */}
          <div className="py-4 border-t border-vault-700 space-y-2">
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
                  DHL/FedEx Express Upgrade available
                </p>
                <p className="text-chrome-500 text-xs">
                  3-7 days &middot; Free upgrade on $300+ orders or 3+ items
                </p>
              </div>
            </div>
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
              DDP — Tax Included
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

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}

function RelatedProducts({
  products,
}: {
  products: Promise<RelatedProductsQuery | null>;
}) {
  return (
    <Suspense
      fallback={
        <section
          aria-busy="true"
          aria-label="Loading related products"
          className="py-16 md:py-24 border-t border-vault-700 mt-16"
        >
          <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({length: 4}).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      }
    >
      <Await resolve={products}>
        {(response) => {
          const items = response?.productRecommendations?.slice(0, 4) ?? [];
          if (items.length === 0) return null;
          return (
            <section className="py-16 md:py-24 border-t border-vault-700 mt-16">
              <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} loading="lazy" />
                ))}
              </div>
            </section>
          );
        }}
      </Await>
    </Suspense>
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

const RELATED_PRODUCTS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_ITEM_FRAGMENT}
  query RelatedProducts(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...ProductItem
    }
  }
` as const;

/**
 * Builds a clean, readable meta description for a product.
 * Prioritizes conversion-relevant info: title, price, authenticity, shipping.
 * Keeps output under 160 chars for optimal Google SERP display.
 */
function buildProductMetaDescription({
  title,
  price,
  currency,
  available,
  beybladeType,
}: {
  title: string;
  price?: string | null;
  currency?: string | null;
  available?: boolean;
  beybladeType?: string | null;
}): string {
  const parts: string[] = [];

  // Core product + price
  const trimmedTitle = title.replace(/\s*—.*$/, '').trim();
  if (price && currency === 'USD') {
    parts.push(`${trimmedTitle} — $${Number(price).toFixed(0)}`);
  } else {
    parts.push(trimmedTitle);
  }

  // Type (Attack/Defense/Stamina/Balance)
  if (beybladeType) {
    parts.push(`${beybladeType} type`);
  }

  // Availability + origin
  if (available === false) {
    parts.push('Currently sold out');
  } else {
    parts.push('Authentic Takara Tomy, direct from Tokyo');
  }

  // Value proposition
  parts.push('Free worldwide shipping, duties included');

  const full = parts.join('. ') + '.';
  return full.length > 160 ? full.substring(0, 157) + '...' : full;
}

interface BeybladeSpecsProduct {
  beybladeType?: {value: string} | null;
  bladeName?: {value: string} | null;
  ratchetSpec?: {value: string} | null;
  bitSpec?: {value: string} | null;
  series?: {value: string} | null;
  modelNumber?: {value: string} | null;
  condition?: {value: string} | null;
  isLimitedEdition?: {value: string} | null;
  generation?: {value: string} | null;
}

function BeybladeSpecs({product}: {product: BeybladeSpecsProduct}) {
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
