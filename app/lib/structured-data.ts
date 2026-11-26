/**
 * schema.org structured data shared by the product, home, about and FAQ
 * pages (2026-11-25, for Google and AI search: ChatGPT / Bing).
 *
 * Every value comes from shipping.ts / site.ts / delivery-estimate.ts, the
 * same sources the visible pages use. Nothing here may state a fact the
 * page does not show (FM10):
 *   - Shipping: only the destinations where standard shipping is free at
 *     checkout (FREE_STANDARD_COUNTRIES — the product page says "Free
 *     tracked shipping to <country>" for exactly these). Other
 *     destinations are priced at checkout by weight, so no rate is given.
 *     Delivery time = the item's own dispatch days (shipping.handling_days)
 *     + Japan Post's standard days, the numbers behind the page's
 *     "Ships within N business days" / "around <date>". Left out when
 *     either is unknown, and for pre-orders (they ship on release).
 *   - Returns: the store's refund policy (RETURNS): 14 days, items sold as
 *     New, unused and as delivered (boxless New items too), return shipping paid by the
 *     buyer. So New offers get that policy, Used offers get "not
 *     returnable", and offers whose condition the product does not state
 *     get no return policy at all (2026-11-26: stating "not returnable" for
 *     an unknown condition was a claim without a source).
 *   - Company: COMPANY / CONTACT_EMAIL / CONTACT_PHONE / EBAY_RECORD in
 *     site.ts.
 */
import {getDeliveryEstimate} from './delivery-estimate';
import {FREE_STANDARD_COUNTRIES, RETURNS} from './shipping';
import {COMPANY, CONTACT_EMAIL, CONTACT_PHONE, EBAY_RECORD, SITE} from './site';

const NEW_CONDITION = 'https://schema.org/NewCondition';
const USED_CONDITION = 'https://schema.org/UsedCondition';

/** The number at the end of a Shopify GID ("gid://shopify/ProductVariant/123"). */
function gidNumber(gid: string | null | undefined): string | undefined {
  const m = /\/(\d+)$/.exec(gid ?? '');
  return m ? m[1] : undefined;
}

/**
 * Offer sku. The variant SKU `EBAY-<item number>` is not published (it is
 * the eBay link, not a shop SKU), so those products use the variant id —
 * the same id the Merchant Center feed uses as g:id (merchant-feed.ts).
 */
export function offerSku(
  sku: string | undefined,
  variantGid: string | null | undefined,
): string | undefined {
  if (sku && !sku.toUpperCase().startsWith('EBAY-')) return sku;
  return gidNumber(variantGid);
}

function days(n: number) {
  return {
    '@type': 'QuantitativeValue' as const,
    minValue: n,
    maxValue: n,
    unitCode: 'DAY',
  };
}

/**
 * MerchantReturnPolicy for the store's refund policy. Valid for the
 * destinations listed in the offer's shipping details.
 */
export function merchantReturnPolicy(siteUrl: string) {
  return {
    '@type': 'MerchantReturnPolicy' as const,
    applicableCountry: [...FREE_STANDARD_COUNTRIES],
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETURNS.windowDays,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    itemCondition: NEW_CONDITION,
    ...(siteUrl && {merchantReturnLink: `${siteUrl}/returns`}),
  };
}

/**
 * Used / pre-owned items: the refund policy (RETURNS) only accepts items sold as New,
 * unused and as delivered, so other conditions are not returnable (owner decision
 * 2026-11-26). Items that arrive damaged are still handled per
 * RETURNS.damaged; schema.org has no field for that, so it is not stated here.
 */
export function noReturnPolicy(siteUrl: string) {
  return {
    '@type': 'MerchantReturnPolicy' as const,
    applicableCountry: [...FREE_STANDARD_COUNTRIES],
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    ...(siteUrl && {merchantReturnLink: `${siteUrl}/returns`}),
  };
}

/** One OfferShippingDetails per destination with free standard shipping. */
export function freeShippingDetails({
  currency,
  handlingDays,
  serviceValue,
  preorder,
}: {
  currency: string;
  handlingDays: number | null;
  serviceValue: string | null | undefined;
  preorder: boolean;
}) {
  return [...FREE_STANDARD_COUNTRIES].map((cc) => {
    const transit = getDeliveryEstimate(cc, handlingDays, serviceValue).standard
      ?.transitDays;
    const deliveryTime =
      !preorder && handlingDays != null && transit != null
        ? {
            '@type': 'ShippingDeliveryTime' as const,
            handlingTime: {
              '@type': 'QuantitativeValue' as const,
              minValue: 0,
              maxValue: handlingDays,
              unitCode: 'DAY',
            },
            transitTime: days(transit),
          }
        : undefined;
    return {
      '@type': 'OfferShippingDetails' as const,
      shippingRate: {
        '@type': 'MonetaryAmount' as const,
        value: 0,
        currency,
      },
      shippingDestination: {
        '@type': 'DefinedRegion' as const,
        addressCountry: cc,
      },
      ...(deliveryTime && {deliveryTime}),
    };
  });
}

/**
 * Extra Offer fields: shipping details, and the return policy by condition
 * (New = returnable, Used = not returnable, not stated = none).
 */
export function offerPolicies({
  siteUrl,
  currency,
  handlingDays,
  serviceValue,
  preorder,
  itemCondition,
}: {
  siteUrl: string;
  currency: string;
  handlingDays: number | null;
  serviceValue: string | null | undefined;
  preorder: boolean;
  itemCondition: string | undefined;
}) {
  return {
    shippingDetails: freeShippingDetails({
      currency,
      handlingDays,
      serviceValue,
      preorder,
    }),
    ...(itemCondition === NEW_CONDITION && {
      hasMerchantReturnPolicy: merchantReturnPolicy(siteUrl),
    }),
    ...(itemCondition === USED_CONDITION && {
      hasMerchantReturnPolicy: noReturnPolicy(siteUrl),
    }),
  };
}

/** "XON株式会社" from COMPANY.displayName "XON (XON株式会社)". */
const LEGAL_NAME =
  /\(([^)]+)\)/.exec(COMPANY.displayName)?.[1] ?? COMPANY.displayName;

/**
 * The store as an OnlineStore run by the operating company. Address parts
 * are COMPANY.postalAddress split into fields (same source).
 */
export function organizationJsonLd(siteUrl: string, logo?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    ...(siteUrl && {'@id': `${siteUrl}/#organization`, url: siteUrl}),
    name: SITE.name,
    ...(logo && {logo}),
    legalName: LEGAL_NAME,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Japan Corporate Number',
      value: COMPANY.corporateNumber,
    },
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE.schema,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mutsumi Bldg. 3F, 2-10-48 Kitasaiwai, Nishi-ku',
      addressLocality: 'Yokohama',
      addressRegion: 'Kanagawa',
      postalCode: '220-0004',
      addressCountry: 'JP',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE.schema,
    },
    sameAs: [EBAY_RECORD.url],
    hasMerchantReturnPolicy: merchantReturnPolicy(siteUrl),
  };
}

/** FAQPage from the questions and plain-text answers shown on /faq. */
export function faqPageJsonLd(items: ReadonlyArray<readonly [string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {'@type': 'Answer', text: a},
    })),
  };
}
