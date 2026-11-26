import {LINK_STORE_POLICIES, PRIVACY_POLICY_READY} from '~/lib/shipping';
import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => [{title: 'Policies | Tokyo Spin Vault'}];

export async function loader({context}: Route.LoaderArgs) {
  if (!LINK_STORE_POLICIES) throw new Response('Not found', {status: 404});
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY, {
    cache: context.storefront.CacheLong(),
  });

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    PRIVACY_POLICY_READY ? shopPolicies?.privacyPolicy : null,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
    // Served by policies.$handle from site.ts (not in the Storefront API).
    {
      id: 'contact-information',
      title: 'Contact information',
      handle: 'contact-information',
    },
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="font-heading text-2xl md:text-3xl text-silver-metallic mb-8">
        Policies
      </h1>
      <div className="grid gap-4">
        {policies.map((policy) => (
          <Link
            key={policy.id}
            to={`/policies/${policy.handle}`}
            className="surface-vault rounded-[4px] p-6 hover:border-silver-400/30 hover: transition-all group"
          >
            <span className="font-heading text-sm text-chrome-200 group-hover:text-silver-400 transition-colors">
              {policy.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
