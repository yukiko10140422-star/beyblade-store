import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;

  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
      variables: {
        language: customerAccount.i18n.language,
      },
    });

    if (errors?.length || !data?.customer) {
      throw new Error('Customer not found');
    }

    return remixData(
      {customer: data.customer},
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    // Customer Account API requires tunnel in local dev
    if (
      error instanceof Response ||
      (error instanceof Error &&
        (error.message.includes('OAuth') || error.message.includes('tunnel')))
    ) {
      throw new Response(
        'Account features require Shopify Oxygen deployment. Not available in local development.',
        {status: 503},
      );
    }
    throw error;
  }
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
      <h1 className="font-heading text-2xl md:text-3xl text-gold-metallic uppercase tracking-wider mb-8">
        {heading}
      </h1>
      <AccountMenu />
      <div className="mt-8">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav
      role="navigation"
      className="flex items-center gap-1 flex-wrap border-b border-vault-700 pb-4"
    >
      <NavLink
        to="/account/orders"
        className={({isActive}) =>
          `font-heading text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'text-gold-400 bg-gold-400/5'
              : 'text-chrome-400 hover:text-gold-400 hover:bg-vault-800'
          }`
        }
      >
        Orders
      </NavLink>
      <NavLink
        to="/account/profile"
        className={({isActive}) =>
          `font-heading text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'text-gold-400 bg-gold-400/5'
              : 'text-chrome-400 hover:text-gold-400 hover:bg-vault-800'
          }`
        }
      >
        Profile
      </NavLink>
      <NavLink
        to="/account/addresses"
        className={({isActive}) =>
          `font-heading text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'text-gold-400 bg-gold-400/5'
              : 'text-chrome-400 hover:text-gold-400 hover:bg-vault-800'
          }`
        }
      >
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout" className="ml-auto">
      <button
        type="submit"
        className="font-heading text-xs uppercase tracking-wider px-4 py-2 rounded-lg text-chrome-600 hover:text-danger-500 hover:bg-vault-800 transition-colors"
      >
        Sign out
      </button>
    </Form>
  );
}
