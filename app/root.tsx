import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLocation,
} from 'react-router';
import type {Route} from './+types/root';
const favicon = '/favicon.png';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {SITE_URL} from '~/lib/constants';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
// Subset weights: Orbitron 500/700/900, Inter 400/500/700, Noto Sans JP 400/700
// (only weights actually used in the project — saves ~30-50% of font bytes)
export const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;700&family=Noto+Sans+JP:wght@400;700&display=swap';

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    // Non-blocking font load (Filament-Group "preload + media swap" pattern):
    //   1. <link rel="preload" as="style"> — fetch CSS early at high priority
    //      without blocking render.
    //   2. <link rel="stylesheet" media="print"> — browser fetches but does
    //      not apply to screen, so it does NOT block first paint.
    //   3. Inline script in Layout swaps media="print" -> "all" once loaded,
    //      applying the fonts. font-display: swap in the URL ensures system
    //      fonts show immediately as a fallback.
    {
      rel: 'preload',
      as: 'style',
      href: FONTS_HREF,
    },
    {
      rel: 'stylesheet',
      href: FONTS_HREF,
      media: 'print',
      // data-font-swap is the marker the inline script in <Layout> picks up.
      'data-font-swap': 'pending',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
    {rel: 'apple-touch-icon', href: '/images/logo.png'},
    {rel: 'manifest', href: '/site.webmanifest'},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const location = useLocation();
  const canonicalUrl = `${SITE_URL}${location.pathname}`;

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#0C0C18" />
        {/* Search engine & social verification -- replace PLACEHOLDER with real values */}
        <meta
          name="google-site-verification"
          content="dBEliAsnYr0LPP5coO3av3reeWXrzpmJ9AwvsMQZVyY"
        />
        <meta
          name="p:domain_verify"
          content="2d861d68f97ec2ce9b173da9cdcf50b6"
        />
        <meta name="msvalidate.01" content="E97753D3F97C661E3363E96380EEACDA" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
        {/* Swap fonts stylesheet from media="print" -> "all" once loaded.
            Pairs with the preload + print-media link emitted by links().
            Runs synchronously at parse time so the swap fires before fonts
            finish downloading; falls back to system fonts via font-display:swap. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.querySelector('link[data-font-swap="pending"]');if(!l)return;function s(){l.media='all';l.removeAttribute('data-font-swap');}if(l.sheet){s();}else{l.addEventListener('load',s,{once:true});}})();`,
          }}
        />
      </head>
      <body className="bg-vault-900 text-chrome-300 font-body antialiased min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-gold-500 focus:text-vault-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-heading focus:text-sm focus:uppercase focus:tracking-wider"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-vault-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-6xl text-gold-metallic mb-4">
          {errorStatus}
        </h1>
        <h2 className="font-heading text-xl text-chrome-200 uppercase tracking-wider mb-6">
          {errorStatus === 404
            ? 'This blade has left the stadium'
            : 'Something went wrong'}
        </h2>
        {errorMessage && (
          <p className="text-chrome-500 text-sm mb-8">{errorMessage}</p>
        )}
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading uppercase tracking-wider text-sm px-6 py-3 rounded-lg transition-all"
        >
          Back to the Vault
        </a>
      </div>
    </div>
  );
}
