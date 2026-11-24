import {detectedCountry} from '~/lib/buyer-country';
import {freeStandardTo, NO_SHIP_BUTTON_NOTE} from '~/lib/shipping';
import {
  Await,
  Link,
  redirect,
  useLoaderData,
  useRouteLoaderData,
} from 'react-router';
import type {RootLoader} from '~/root';
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
import type {
  ProductItemFragment,
  RelatedProductsQuery,
} from 'storefrontapi.generated';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {StickyAtcBar} from '~/components/StickyAtcBar';
import {ProductCard} from '~/components/ProductCard';
import {ProductCardSkeleton} from '~/components/home/ProductCardSkeleton';
import {PaymentMethods} from '~/components/PaymentMethods';
import {
  DeliveryBox,
  RandomNote,
  ReturnsNote,
  StockNote,
} from '~/components/PurchaseInfo';
import {getDeliveryEstimate, parseHandlingDays} from '~/lib/delivery-estimate';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {MONEY_FRAGMENT, PRODUCT_ITEM_FRAGMENT} from '~/lib/fragments';
import {SITE_URL} from '~/lib/constants';
import {SHELVES, SITE, isOwnProduct} from '~/lib/site';
import {
  getBeyDetailRows,
  getItemCondition,
  metaValue,
  type BeyMetafields,
} from '~/lib/bey-attributes';

/** Google product taxonomy id 3466. */
const GOOGLE_PRODUCT_CATEGORY =
  'Toys & Games > Toys > Activity Toys > Spinning Tops';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  const shelf = data?.shelf;
  const bey: BeyMetafields = product ?? {};
  const condition = getItemCondition(bey);
  const rawTitle = product?.title ?? '';
  const title = buildMetaTitle(rawTitle, product?.seo?.title?.trim());
  const description =
    product?.seo?.description?.trim() ||
    buildProductMetaDescription({
      title: rawTitle,
      price: product?.selectedOrFirstAvailableVariant?.price?.amount,
      currency: product?.selectedOrFirstAvailableVariant?.price?.currencyCode,
      available: product?.selectedOrFirstAvailableVariant?.availableForSale,
      bey,
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
    {property: 'og:site_name', content: SITE.name},
    {property: 'product:price:amount', content: price},
    {property: 'product:price:currency', content: currency},
    {
      property: 'product:availability',
      content: !available
        ? 'out of stock'
        : isPreOrderProduct(product)
          ? 'preorder'
          : 'in stock',
    },
    ...(condition
      ? [{property: 'product:condition', content: condition.og}]
      : []),
    ...(product?.vendor
      ? [{property: 'product:brand', content: product.vendor}]
      : []),
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
            barcode: product?.selectedOrFirstAvailableVariant?.barcode,
            price,
            currency,
            available,
            siteUrl: SITE_URL,
          }),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {name: 'Home', item: SITE_URL},
              ...(shelf
                ? [
                    {
                      name: shelf.title,
                      item: `${SITE_URL}/collections/${shelf.handle}`,
                    },
                  ]
                : []),
              {name: rawTitle, item: productUrl},
            ].map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              ...crumb,
            })),
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
    variantId: criticalData.product.selectedOrFirstAvailableVariant?.id,
    shelfHandle: criticalData.shelf?.handle,
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
  variantId,
  shelfHandle,
}: Route.LoaderArgs & {
  productId: string;
  variantId?: string;
  shelfHandle?: string;
}) {
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {productId},
      cache: context.storefront.CacheShort(),
    })
    .catch((error: unknown) => {
      console.error('Related products query failed:', error);
      return null;
    });

  // Stock count. quantityAvailable needs the Storefront token scope
  // `unauthenticated_read_product_inventory`; without it the query errors,
  // so it is isolated here and resolves to null (UI then says "Available").
  const stockQuantity: Promise<number | null> = variantId
    ? context.storefront
        .query(VARIANT_STOCK_QUERY, {
          variables: {id: variantId},
          cache: context.storefront.CacheShort(),
        })
        .then((res) => {
          const node = res.node;
          return node && 'quantityAvailable' in node
            ? (node.quantityAvailable ?? null)
            : null;
        })
        .catch(() => null)
    : Promise.resolve(null);

  // "More from this shelf": products from the first shelf this product is in.
  const shelfProducts: Promise<ProductItemFragment[] | null> = shelfHandle
    ? context.storefront
        .query(SHELF_PRODUCTS_QUERY, {
          variables: {handle: shelfHandle},
          cache: context.storefront.CacheShort(),
        })
        .then((res) =>
          (res.collection?.products.nodes ?? []).filter(
            (p) => p.id !== productId && isOwnProduct(p),
          ),
        )
        .catch((error: unknown) => {
          console.error('Shelf products query failed:', error);
          return null;
        })
    : Promise.resolve(null);

  // "You May Also Like" never repeats a product already in "More from".
  const relatedDeduped = Promise.all([relatedProducts, shelfProducts]).then(
    ([res, shelf]) => {
      if (!res) return res;
      const shown = new Set((shelf ?? []).map((p) => p.id));
      return {
        ...res,
        productRecommendations: (res.productRecommendations ?? []).filter(
          (p) => !shown.has(p.id),
        ),
      };
    },
  );

  return {relatedProducts: relatedDeduped, stockQuantity, shelfProducts};
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

  // Shared Shopify store: products of the sister stores are not served here.
  if (!product?.id || !isOwnProduct(product)) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  // First shelf (allowlisted collection) this product belongs to.
  const shelf =
    SHELVES.find((sh) =>
      product.collections.nodes.some((c) => c.handle === sh.handle),
    ) ?? null;

  return {
    product,
    shelf,
    // Delivery dates for the buyer's country (Oxygen geo / country cookie).
    deliveryEstimate: {
      ...getDeliveryEstimate(
        storefront.i18n.country,
        parseHandlingDays(product.handlingDays?.value),
        product.shippingService?.value,
      ),
      freeStandardTo: freeStandardTo(detectedCountry(request)),
    },
  };
}

export default function Product() {
  const {
    product,
    relatedProducts,
    shelf,
    shelfProducts,
    stockQuantity,
    deliveryEstimate,
  } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isPreOrder = isPreOrderProduct(product);
  const isRandom =
    product.tags?.some((t) => t.toLowerCase() === 'random-assortment') ??
    false;
  const blockedReason = deliveryEstimate.shipsHere
    ? undefined
    : NO_SHIP_BUTTON_NOTE;
  // Quantity limit until stock is known.
  const defaultMax = 99;

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

  const model = metaValue(product.modelNumber);
  const series = metaValue(product.series);
  const altText = title;
  const handlingDays = parseHandlingDays(product.handlingDays?.value);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-10 md:px-10">
      <Breadcrumbs
        className="pb-4 pt-[18px] md:pb-5"
        truncateLast
        items={[
          {label: 'Home', href: '/'},
          shelf
            ? {label: shelf.title, href: `/collections/${shelf.handle}`}
            : {label: 'All products', href: '/collections/all'},
          {label: title},
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <ProductImage
            key={product.id}
            image={selectedVariant?.image}
            media={mediaImages}
            alt={altText}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {(model || series) && (
            <span className="text-[13px] text-chrome-400">
              {model && <span className="font-mono">{model}</span>}
              {model && series && ' · '}
              {series}
            </span>
          )}
          <h1 className="m-0 text-[22px] font-bold leading-tight text-chrome-200 md:text-[28px]">
            {title}
          </h1>
          <div className="flex flex-wrap items-baseline gap-3">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
            <StockNote
              quantity={stockQuantity}
              available={selectedVariant?.availableForSale ?? false}
              isPreOrder={isPreOrder}
              inHand={product.inHand?.value === 'true'}
            />
          </div>

          {/* Key facts before Add to cart: model number and version. */}
          <KeyFacts product={product} />

          {/* Add to cart (observed by StickyAtcBar) */}
          {isRandom && <RandomNote />}

          <div data-primary-atc>
            <Suspense
              fallback={
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                  isPreOrder={isPreOrder}
                  expectedShipDate={
                    product.expectedShipDate?.value ?? undefined
                  }
                  maxQuantity={defaultMax}
                  blockedReason={blockedReason}
                />
              }
            >
              <Await resolve={stockQuantity} errorElement={null}>
                {(q) => (
                  <ProductForm
                    productOptions={productOptions}
                    selectedVariant={selectedVariant}
                    isPreOrder={isPreOrder}
                    expectedShipDate={
                      product.expectedShipDate?.value ?? undefined
                    }
                    maxQuantity={q ?? defaultMax}
                    blockedReason={blockedReason}
                  />
                )}
              </Await>
            </Suspense>
          </div>
          <PaymentMethods settings={rootData?.header?.shop.paymentSettings} />

          {!isPreOrder && <DeliveryBox estimate={deliveryEstimate} />}
          <ReturnsNote />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <DetailsTable product={product} />
          {descriptionHtml && (
            <section>
              <h2 className="mb-3 mt-0 text-xl font-bold text-chrome-200">
                Description
              </h2>
              <div
                className="text-[15px] leading-relaxed [&>p]:mb-3 [&>ul]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&_a]:text-holo-500 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-chrome-200"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </section>
          )}
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

      {shelf && (
        <ProductRail
          title={`More from ${shelf.title}`}
          products={shelfProducts}
          viewAllHref={`/collections/${shelf.handle}`}
        />
      )}
      <RelatedProducts products={relatedProducts} />

      {/* Mobile sticky ATC — appears after scrolling past primary ATC */}
      <StickyAtcBar
        isPreOrder={isPreOrder}
        blocked={Boolean(blockedReason)}
        selectedVariant={selectedVariant}
        productTitle={title}
        productImage={selectedVariant?.image}
      />
    </div>
  );
}

function ProductRail({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Promise<ProductItemFragment[] | null>;
  viewAllHref: string;
}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={products} errorElement={null}>
        {(items) => {
          const list = (items ?? []).slice(0, 8);
          if (list.length === 0) return null;
          return (
            <section className="py-12 md:py-16 border-t border-vault-700 mt-12">
              <div className="flex items-end justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-vault-50 tracking-tight">
                  {title}
                </h2>
                <Link
                  to={viewAllHref}
                  prefetch="intent"
                  className="shrink-0 text-holo-500 hover:text-holo-600 text-xs font-heading font-semibold"
                >
                  View all &rarr;
                </Link>
              </div>
              {/* Mobile: horizontal swipe rail. Desktop: 4-column grid. */}
              <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
                {list.map((p) => (
                  <div
                    key={p.id}
                    className="w-[46%] shrink-0 snap-start md:w-auto"
                  >
                    <ProductCard product={p} loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          );
        }}
      </Await>
    </Suspense>
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
          <h2 className="font-heading text-xl md:text-2xl text-silver-metallic mb-8">
            Related items
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
          const items = (response?.productRecommendations ?? [])
            .filter(isOwnProduct)
            .slice(0, 4);
          if (items.length === 0) return null;
          return (
            <section className="py-16 md:py-24 border-t border-vault-700 mt-16">
              <h2 className="font-heading text-xl md:text-2xl text-silver-metallic mb-8">
                Related items
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
    barcode
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
    collections(first: 10) {
      nodes {
        handle
      }
    }
    expectedShipDate: metafield(namespace: "custom", key: "expected_ship_date") { value }
    shippingService: metafield(namespace: "shipping", key: "service") { value }
    beybladeType: metafield(namespace: "beyblade", key: "type") { value }
    bladeName: metafield(namespace: "beyblade", key: "blade_name") { value }
    ratchetSpec: metafield(namespace: "beyblade", key: "ratchet_spec") { value }
    bitSpec: metafield(namespace: "beyblade", key: "bit_spec") { value }
    series: metafield(namespace: "beyblade", key: "series") { value }
    modelNumber: metafield(namespace: "beyblade", key: "model_number") { value }
    condition: metafield(namespace: "beyblade", key: "condition") { value }
    isLimitedEdition: metafield(namespace: "beyblade", key: "is_limited_edition") { value }
    generation: metafield(namespace: "beyblade", key: "generation") { value }
    handlingDays: metafield(namespace: "shipping", key: "handling_days") { value }
    inHand: metafield(namespace: "shipping", key: "in_hand") { value }
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

const VARIANT_STOCK_QUERY = `#graphql
  query VariantStock($id: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    node(id: $id) {
      ... on ProductVariant {
        quantityAvailable
      }
    }
  }
` as const;

const SHELF_PRODUCTS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_ITEM_FRAGMENT}
  query ShelfProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 9, sortKey: CREATED, reverse: true) {
        nodes {
          ...ProductItem
        }
      }
    }
  }
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
 * Product JSON-LD for rich results.
 *
 * Only facts carried by the product data are emitted: no invented brand,
 * no shipping rates / delivery times / return window (not decided yet —
 * add them here once they are real, see docs/shopify-setup.md).
 * itemCondition: factory-sealed = New, everything else = Used.
 */
function buildProductJsonLd({
  product,
  productUrl,
  image,
  sku,
  barcode,
  price,
  currency,
  available,
  siteUrl,
}: {
  product:
    | (BeyMetafields & {
        title?: string;
        description?: string;
        vendor?: string;
        tags?: string[];
      })
    | undefined;
  productUrl: string;
  image: string;
  sku: string | undefined;
  barcode?: string | null;
  price: string;
  currency: string;
  available: boolean;
  siteUrl: string;
}) {
  const bey: BeyMetafields = product ?? {};
  const additionalProperty = getBeyDetailRows(bey).map((r) => ({
    '@type': 'PropertyValue' as const,
    name: r.label,
    value: r.value,
  }));
  const condition = getItemCondition(bey);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.title,
    description: product?.description,
    image,
    url: productUrl,
    sku: sku?.toUpperCase().startsWith('EBAY-') ? undefined : sku,
    ...(barcode && /^(?:\d{8}|\d{12,14})$/.test(barcode) && {
      [`gtin${barcode.length}`]: barcode,
    }),
    ...(product?.vendor && {
      brand: {'@type': 'Brand', name: product.vendor},
    }),
    category: GOOGLE_PRODUCT_CATEGORY,
    ...(additionalProperty.length > 0 && {additionalProperty}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: parseFloat(price),
      priceCurrency: currency,
      ...(condition && {itemCondition: condition.schema}),
      availability: !available
        ? 'https://schema.org/OutOfStock'
        : isPreOrderProduct(product)
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE.name,
        url: siteUrl,
      },
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
function buildMetaTitle(productTitle: string, seoTitle?: string): string {
  const rawTitle = seoTitle || productTitle;
  const SUFFIX_FULL = ` | ${SITE.name}`;
  const SUFFIX_SHORT = ` | ${SITE.shortName}`;
  const MAX_TITLE_LEN = 60;

  if (!rawTitle) return SITE.name;

  const withFullSuffix = rawTitle + SUFFIX_FULL;
  if (withFullSuffix.length <= MAX_TITLE_LEN) return withFullSuffix;

  if (seoTitle && seoTitle.length + SUFFIX_SHORT.length <= MAX_TITLE_LEN) {
    return seoTitle + SUFFIX_SHORT;
  }

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
 * Meta description: title, price, grade / condition, origin. < 160 chars.
 */
function buildProductMetaDescription({
  title,
  price,
  currency,
  available,
  bey,
}: {
  title: string;
  price?: string | null;
  currency?: string | null;
  available?: boolean;
  bey: BeyMetafields;
}): string {
  const parts: string[] = [];
  const trimmedTitle = title.replace(/\s*—.*$/, '').trim();
  if (price && currency === 'USD') {
    parts.push(`${trimmedTitle} — $${Number(price).toFixed(0)}`);
  } else {
    parts.push(trimmedTitle);
  }
  const model = metaValue(bey.modelNumber);
  if (model) parts.push(`Model ${model}, Japanese version`);
  parts.push(available === false ? 'Currently sold out' : 'Ships from Japan');
  const full = parts.join('. ') + '.';
  return full.length > 160 ? full.substring(0, 157) + '...' : full;
}

/** Model number and version, above Add to cart. */
function KeyFacts({product}: {product: BeyMetafields}) {
  const model = metaValue(product.modelNumber);
  const series = metaValue(product.series);
  if (!model && !series) return null;
  return (
    <section
      aria-label="Key facts"
      className="flex flex-col gap-2 rounded-[4px] border border-vault-700 bg-vault-800 p-4 text-sm"
    >
      {model && (
        <div className="flex items-center gap-2.5">
          <span className="rounded-[3px] bg-holo-500 px-2 py-0.5 font-mono text-[13px] font-medium text-white">
            {model}
          </span>
          <span className="font-semibold text-chrome-200">
            Japanese version
          </span>
        </div>
      )}
      {series && <span>Series: {series}</span>}
    </section>
  );
}

function DetailsTable({product}: {product: BeyMetafields}) {
  const rows = getBeyDetailRows(product);
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 mt-0 text-xl font-bold text-chrome-200">Details</h2>
      <dl className="m-0 rounded-[4px] border border-vault-700 bg-white">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-3 border-b border-vault-700 px-4 py-[11px] text-sm last:border-b-0"
          >
            <dt className="text-chrome-400">{r.label}</dt>
            <dd
              className={
                r.mono
                  ? 'col-span-2 m-0 font-mono text-chrome-200'
                  : 'col-span-2 m-0 text-chrome-200'
              }
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function isPreOrderProduct(
  product: {tags?: string[] | null} | undefined | null,
): boolean {
  return product?.tags?.some((t) => t.toLowerCase() === 'pre-order') ?? false;
}
