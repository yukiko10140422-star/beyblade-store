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
import {PerformanceChart} from '~/components/PerformanceChart';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import {SITE_URL} from '~/lib/constants';
import {
  CheckCircleIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  GlobeIcon,
  LockIcon,
} from '~/components/icons';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const rawTitle = product?.title ?? '';
  const title = buildMetaTitle(rawTitle);
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
  const rawImage = variantImage?.url ?? '';
  // Request a 1200x630 crop from Shopify CDN for OG / Twitter summary_large_image.
  const image = rawImage
    ? rawImage.includes('?')
      ? `${rawImage}&width=1200&height=630&crop=center`
      : `${rawImage}?width=1200&height=630&crop=center`
    : '';
  const productUrl = `${SITE_URL}/products/${product?.handle ?? ''}`;
  const sku = sanitizeSku(product?.selectedOrFirstAvailableVariant?.sku);
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
    {property: 'og:image:width', content: '1200'},
    {property: 'og:image:height', content: '630'},
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {property: 'product:price:amount', content: price},
    {property: 'product:price:currency', content: currency},
    {
      property: 'product:availability',
      content: available ? 'in stock' : 'out of stock',
    },
    {property: 'product:condition', content: 'new'},
    {
      property: 'product:brand',
      content: product?.vendor || 'Takara Tomy',
    },
    ...(sku ? [{property: 'product:retailer_item_id', content: sku}] : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: image},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@graph': [
          buildProductJsonLd({
            product,
            productUrl,
            image,
            sku,
            price,
            currency,
            available,
          }),
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
                name: rawTitle,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is this an authentic Takara Tomy product?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Every Beyblade sold at Tokyo Spin Vault is 100% authentic Takara Tomy, sourced directly from authorized Japanese retailers. We are based in Tokyo, Japan.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I have to pay customs duties or import taxes?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. All prices include duties and taxes (DDP — Delivered Duty Paid). You will never be charged extra fees at delivery.',
                },
              },
              {
                '@type': 'Question',
                name: 'How long does shipping take?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Free shipping via ePacket Light takes 7-14 business days to the US/Canada, 10-18 days to Europe, and 5-12 days to Asia-Pacific. DHL/FedEx Express upgrade (3-7 days) is available and free on orders over $300 or 3+ items.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is your return policy?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We accept returns within 30 days of delivery for unused items in original packaging. Contact us at support@tokyospinvault.com to initiate a return.',
                },
              },
            ],
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

  // Extract media images for gallery
  const mediaImages = (product.media?.nodes ?? []).filter(
    (
      n,
    ): n is {
      __typename: 'MediaImage';
      id: string;
      image: {
        id?: string;
        url: string;
        altText?: string | null;
        width?: number;
        height?: number;
      };
    } => n.__typename === 'MediaImage' && !!n.image,
  );

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
        {/* Left: Image Gallery */}
        <ProductImage image={selectedVariant?.image} media={mediaImages} />

        {/* Right: Product Info */}
        <div className="lg:sticky lg:top-[104px] lg:self-start space-y-6">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-chrome-500 text-xs font-heading uppercase tracking-[0.2em]">
              {product.vendor}
            </p>
          )}

          {/* Availability Badge + Title */}
          <TypeBadge tags={product.tags?.join(', ')} size="md" />
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
            isPreOrder={product.tags?.includes('pre-order') ?? false}
            expectedShipDate={product.expectedShipDate?.value ?? undefined}
          />

          {/* Shipping & Duties Notice */}
          <div className="py-3 px-4 rounded-lg bg-gold-400/5 border border-gold-400/10 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-gold-400 flex-shrink-0" />
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
              <PaperAirplaneIcon className="w-5 h-5 text-gold-400 flex-shrink-0" />
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
              <ShieldCheckIcon className="w-4 h-4 text-gold-400" />
              100% Authentic
            </div>
            <div className="flex items-center gap-2 text-chrome-500 text-xs">
              <GlobeIcon className="w-4 h-4 text-gold-400" />
              Fully Tracked
            </div>
            <div className="flex items-center gap-2 text-chrome-500 text-xs">
              <LockIcon className="w-4 h-4 text-gold-400" />
              DDP — Tax Included
            </div>
          </div>

          {/* Beyblade Specs (metafields) */}
          <BeybladeSpecs product={product} />

          {/* Performance Chart (if data exists for this product) */}
          {PERFORMANCE_DATA[product.handle] && (
            <PerformanceChart
              stats={PERFORMANCE_DATA[product.handle].stats}
              staminaRange={PERFORMANCE_DATA[product.handle].staminaRange}
            />
          )}

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
    media(first: 30) {
      nodes {
        __typename
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    tags
    seo {
      description
      title
    }
    expectedShipDate: metafield(namespace: "custom", key: "expected_ship_date") { value }
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
 * Builds an enriched Product JSON-LD schema for Google rich results,
 * AI shopping surfaces (Google AI Overviews, Bing Copilot), and
 * the Universal Commerce Protocol (UCP).
 *
 * Includes: countryOfOrigin, manufacturer, itemCondition,
 * shippingDetails with rate/time, returnPolicy, and Beyblade-specific
 * additionalProperty fields from metafields.
 */
function buildProductJsonLd({
  product,
  productUrl,
  image,
  sku,
  price,
  currency,
  available,
}: {
  product: Record<string, unknown> | undefined;
  productUrl: string;
  image: string;
  sku: string | undefined;
  price: string;
  currency: string;
  available: boolean;
}) {
  const p = product as
    | {
        title?: string;
        description?: string;
        vendor?: string;
        beybladeType?: {value: string} | null;
        bladeName?: {value: string} | null;
        series?: {value: string} | null;
        modelNumber?: {value: string} | null;
        generation?: {value: string} | null;
        condition?: {value: string} | null;
        ratchetSpec?: {value: string} | null;
        bitSpec?: {value: string} | null;
      }
    | undefined;

  // Build additionalProperty from metafields
  const additionalProperty = [
    p?.beybladeType?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Beyblade Type',
      value: p.beybladeType.value,
    },
    p?.series?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Series',
      value: p.series.value,
    },
    p?.modelNumber?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Model Number',
      value: p.modelNumber.value,
    },
    p?.bladeName?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Blade',
      value: p.bladeName.value,
    },
    p?.ratchetSpec?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Ratchet',
      value: p.ratchetSpec.value,
    },
    p?.bitSpec?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Bit',
      value: p.bitSpec.value,
    },
    p?.generation?.value && {
      '@type': 'PropertyValue' as const,
      name: 'Generation',
      value: p.generation.value,
    },
  ].filter(Boolean);

  const conditionValue = p?.condition?.value?.toLowerCase();
  const itemCondition =
    conditionValue === 'used'
      ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/NewCondition';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p?.title,
    description: p?.description,
    image,
    url: productUrl,
    sku,
    brand: {
      '@type': 'Brand',
      name: p?.vendor || 'Takara Tomy',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Takara Tomy',
    },
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Japan',
    },
    category: 'Toys & Games > Spinning Tops',
    ...(additionalProperty.length > 0 && {additionalProperty}),
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'GB', 'AU', 'CA'],
      returnPolicyCategory:
        'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 30,
      returnMethod: 'https://schema.org/ReturnByMail',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: parseFloat(price),
      priceCurrency: currency,
      itemCondition,
      availability: available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Tokyo Spin Vault',
        url: 'https://tokyospinvault.com',
      },
      shippingDetails: [
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'USD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'US',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 7,
              maxValue: 14,
              unitCode: 'DAY',
            },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'USD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'GB',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 10,
              maxValue: 18,
              unitCode: 'DAY',
            },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'USD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'AU',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 5,
              maxValue: 12,
              unitCode: 'DAY',
            },
          },
        },
        {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0',
            currency: 'USD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'CA',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 7,
              maxValue: 14,
              unitCode: 'DAY',
            },
          },
        },
      ],
    },
  };
}

/**
 * Returns the SKU only if it looks valid.
 * Rejects: empty, too short, ends with hyphen (= truncated by Shopify 40-char limit),
 * placeholder patterns like "SKU" or "TSV-".
 */
function sanitizeSku(sku: string | null | undefined): string | undefined {
  if (!sku) return undefined;
  const trimmed = sku.trim();
  if (trimmed.length < 4) return undefined;
  if (trimmed.endsWith('-')) return undefined;
  if (/^(sku|na|tbd|placeholder)$/i.test(trimmed)) return undefined;
  return trimmed;
}

/**
 * Builds a SEO-friendly meta title that fits Google SERP limits (~60 chars).
 * Truncates at word / punctuation boundaries — never cuts mid-word.
 * Falls back to full title + brand when short.
 */
function buildMetaTitle(rawTitle: string): string {
  const SUFFIX_FULL = ' | Tokyo Spin Vault';
  const SUFFIX_SHORT = ' | TSV';
  const MAX_TITLE_LEN = 60;

  if (!rawTitle) return 'Tokyo Spin Vault';

  const withFullSuffix = rawTitle + SUFFIX_FULL;
  if (withFullSuffix.length <= MAX_TITLE_LEN) return withFullSuffix;

  const budget = MAX_TITLE_LEN - SUFFIX_SHORT.length - 1; // -1 for the ellipsis

  // Try natural boundary first: em dash, hyphen with spaces, parentheses
  const boundaryRegex = / — | - | \(|【/;
  const boundaryMatch = rawTitle.slice(0, budget).match(boundaryRegex);
  if (boundaryMatch && boundaryMatch.index && boundaryMatch.index > 15) {
    return rawTitle.slice(0, boundaryMatch.index).trim() + SUFFIX_SHORT;
  }

  // Otherwise cut at the last space within budget
  const lastSpace = rawTitle.slice(0, budget).lastIndexOf(' ');
  if (lastSpace > 15) {
    return rawTitle.slice(0, lastSpace).trim() + '…' + SUFFIX_SHORT;
  }

  // Last resort: hard cut + ellipsis
  return rawTitle.slice(0, budget).trim() + '…' + SUFFIX_SHORT;
}

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

/**
 * Performance data per product handle.
 * Stats: 1-5 scale (attack, stamina, defense, burst resistance, versatility).
 * Sourced from kyoganken spin-time database + competitive meta analysis.
 */
const PERFORMANCE_DATA: Record<
  string,
  {
    stats: {
      attack: number;
      stamina: number;
      defense: number;
      burst: number;
      versatility: number;
    };
    staminaRange?: string;
  }
> = {
  'beyblade-x-ux-00-aero-pegasus-3-70a-red-version-japan-exclusive': {
    stats: {attack: 5, stamina: 3, defense: 2, burst: 3, versatility: 4},
    staminaRange: '125–168s',
  },
  'beyblade-x-bx-00-starter-cobaltdragoon-9-60f-metal-coat-white-j-league-ver':
    {
      stats: {attack: 3, stamina: 4, defense: 4, burst: 4, versatility: 5},
      staminaRange: '140–185s',
    },
  'beyblade-x-bx-00-starter-dransword-1-60v-metal-coat-black-j-league-ver': {
    stats: {attack: 4, stamina: 3, defense: 3, burst: 4, versatility: 4},
    staminaRange: '110–136s',
  },
  'beyblade-x-takara-tomy-cx-16-bahamut-blitz-bk1-50i-special-ver': {
    stats: {attack: 4, stamina: 4, defense: 3, burst: 4, versatility: 5},
    staminaRange: '130–175s',
  },
  'beyblade-x-ux-00-dran-buster-1-60a-color-booster-choice-violet': {
    stats: {attack: 5, stamina: 2, defense: 2, burst: 3, versatility: 3},
    staminaRange: '95–130s',
  },
  'beyblade-x-valkyrie-volt-s4-70v-metal-coat-gold-cx-11-emperor-might-deck-set':
    {
      stats: {attack: 5, stamina: 3, defense: 3, burst: 4, versatility: 5},
      staminaRange: '115–155s',
    },
  'beyblade-x-perseus-dark-gold-g3-tournament-winning-prize-set-of-3': {
    stats: {attack: 3, stamina: 4, defense: 5, burst: 5, versatility: 4},
    staminaRange: '155–200s',
  },
  'beyblade-x-wizard-rod-metal-coat-gold-unused-g3-tournament-1st-prize-only-blade':
    {
      stats: {attack: 2, stamina: 5, defense: 3, burst: 4, versatility: 4},
      staminaRange: '180–247s',
    },
  'beyblade-x-orochi-cluster-6-60lf-corocoro-comic-executive-2025': {
    stats: {attack: 3, stamina: 4, defense: 4, burst: 3, versatility: 3},
    staminaRange: '135–170s',
  },
  'set-of-2-beyblade-x-bx-00-cobaltdragoon-9-60f-draonsword-1-60v-j-league-cobalt':
    {
      stats: {attack: 4, stamina: 4, defense: 4, burst: 4, versatility: 5},
      staminaRange: '110–185s',
    },
  'us-duty-free-beyblade-x-valkyrie-volt-s4-70v-metal-coat-gold': {
    stats: {attack: 5, stamina: 3, defense: 3, burst: 4, versatility: 4},
    staminaRange: '115–155s',
  },
  'set-of-10-beyblade-x-valkyrie-volt-s4-70v-metal-coat-gold-us-duty-free': {
    stats: {attack: 5, stamina: 3, defense: 3, burst: 4, versatility: 4},
    staminaRange: '115–155s',
  },
  'us-duty-free-beyblade-x-wizard-rod-gold-tournament-winning-prize-no-bey-code':
    {
      stats: {attack: 2, stamina: 5, defense: 3, burst: 4, versatility: 4},
      staminaRange: '180–247s',
    },
  'v-bit-vortex-j-league-ver-beyblade-x': {
    stats: {attack: 3, stamina: 4, defense: 3, burst: 3, versatility: 3},
  },
  'beyblade-x-g2-tournament-winner-prize-string-launcher-gold': {
    stats: {attack: 3, stamina: 3, defense: 3, burst: 3, versatility: 5},
  },
  'beyblade-x-ux-00-samurai-saber-5-60k-metal-coat-samurai-blue-japan-national-team-ver':
    {
      stats: {attack: 4, stamina: 3, defense: 3, burst: 4, versatility: 4},
      staminaRange: '120–160s',
    },
};

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
