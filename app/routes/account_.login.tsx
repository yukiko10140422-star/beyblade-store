import type {Route} from './+types/account_.login';

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const acrValues = url.searchParams.get('acr_values') || undefined;
  const loginHint = url.searchParams.get('login_hint') || undefined;
  const loginHintMode = url.searchParams.get('login_hint_mode') || undefined;
  const locale = url.searchParams.get('locale') || undefined;

  try {
    return await context.customerAccount.login({
      countryCode: context.storefront.i18n.country,
      acrValues,
      loginHint,
      loginHintMode,
      locale,
    });
  } catch (error) {
    // Customer Account API requires Hydrogen tunnel in local dev
    if (error instanceof Error && error.message.includes('OAuth')) {
      throw new Response(
        'Account login is not available in local development. It will work after deploying to Shopify Oxygen.',
        {status: 503},
      );
    }
    throw error;
  }
}
