import {createHydrogenContext} from '@shopify/hydrogen';
import type {
  CountryCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT, MONEY_FRAGMENT} from '~/lib/fragments';

/**
 * Resolve the storefront i18n context for the current request.
 *
 * Precedence:
 *   1. `customerCountry` cookie (set by a future country picker UI)
 *   2. `oxygen-buyer-country` header (Shopify Oxygen edge geo)
 *   3. Default `US`
 *
 * Language is locked to EN — store is English-only at the storefront layer.
 * Country is forwarded to the Storefront API via `@inContext(country: ...)`,
 * so Markets-covered countries see localized currency, others fall back to base USD.
 */
function getLocaleFromRequest(request: Request): {
  language: LanguageCode;
  country: CountryCode;
} {
  const language: LanguageCode = 'EN';
  const cookie = request.headers.get('cookie') || '';
  const cookieMatch = cookie.match(/(?:^|;\s*)customerCountry=([A-Za-z]{2})/);
  if (cookieMatch) {
    return {language, country: cookieMatch[1].toUpperCase() as CountryCode};
  }

  const buyerCountry = request.headers.get('oxygen-buyer-country');
  if (buyerCountry && /^[A-Za-z]{2}$/.test(buyerCountry)) {
    return {language, country: buyerCountry.toUpperCase() as CountryCode};
  }

  return {language, country: 'US' as CountryCode};
}

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  if (!env?.PUBLIC_STORE_DOMAIN) {
    throw new Error('PUBLIC_STORE_DOMAIN environment variable is not set');
  }
  if (!env?.PUBLIC_STOREFRONT_API_TOKEN) {
    throw new Error(
      'PUBLIC_STOREFRONT_API_TOKEN environment variable is not set',
    );
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      // Detect country from cookie / Oxygen buyer-country header so Markets-covered
      // countries see localized currency. Defaults to US.
      i18n: getLocaleFromRequest(request),
      cart: {
        queryFragment: `${MONEY_FRAGMENT}\n${CART_QUERY_FRAGMENT}`,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
