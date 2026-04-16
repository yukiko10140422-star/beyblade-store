import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="space-y-8">
      <h2 className="font-heading text-2xl text-gold-400 uppercase tracking-wider">
        Orders
      </h2>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({
  orders,
  filters,
}: {
  orders: CustomerOrdersFragment['orders'];
  filters: OrderFilterParams;
}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div className="space-y-4" aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-vault-800 border border-vault-700 rounded-lg">
      <p className="text-chrome-400 text-lg mb-4">
        {hasFilters
          ? 'No orders found matching your search.'
          : "You haven't placed any orders yet."}
      </p>
      {hasFilters ? (
        <Link
          to="/account/orders"
          className="text-gold-500 hover:text-gold-400 font-heading uppercase tracking-wider text-sm transition-colors"
        >
          Clear filters &rarr;
        </Link>
      ) : (
        <Link
          to="/collections"
          className="inline-block mt-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-vault-900 font-heading uppercase tracking-wider text-sm rounded-lg transition-colors"
        >
          Start Shopping &rarr;
        </Link>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-vault-800 border border-vault-700 rounded-lg p-4"
      aria-label="Search orders"
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-chrome-400 text-xs uppercase tracking-wider font-heading mb-3">
          Filter Orders
        </legend>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="flex-1 bg-vault-900 border border-vault-700 rounded-md px-3 py-2 text-chrome-200 placeholder:text-chrome-600 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors"
          />
          <input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="flex-1 bg-vault-900 border border-vault-700 rounded-md px-3 py-2 text-chrome-200 placeholder:text-chrome-600 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-vault-900 font-heading uppercase tracking-wider text-xs rounded-md transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {hasFilters && (
              <button
                type="button"
                disabled={isSearching}
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                  formRef.current?.reset();
                }}
                className="px-5 py-2 border border-vault-600 hover:border-chrome-500 text-chrome-400 hover:text-chrome-200 disabled:opacity-50 font-heading uppercase tracking-wider text-xs rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const isComplete =
    order.financialStatus === 'PAID' || order.financialStatus === 'REFUNDED';

  return (
    <div className="bg-vault-800 border border-vault-700 rounded-lg p-4 hover:border-vault-600 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Order info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to={`/account/orders/${btoa(order.id)}`}
              className="font-heading text-gold-400 text-lg tracking-wider hover:text-gold-300 transition-colors"
            >
              #{order.number}
            </Link>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-heading ${
                isComplete
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'bg-chrome-500/10 text-chrome-400 border border-chrome-500/20'
              }`}
            >
              {order.financialStatus}
            </span>
            {fulfillmentStatus && (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-heading bg-chrome-500/10 text-chrome-400 border border-chrome-500/20">
                {fulfillmentStatus}
              </span>
            )}
          </div>
          <p className="text-chrome-500 text-sm">
            {new Date(order.processedAt).toDateString()}
          </p>
          {order.confirmationNumber && (
            <p className="text-chrome-600 text-xs">
              Confirmation: {order.confirmationNumber}
            </p>
          )}
        </div>

        {/* Right: Price + action */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
          <span className="text-gold-400 font-heading text-lg">
            <Money data={order.totalPrice} />
          </span>
          <Link
            to={`/account/orders/${btoa(order.id)}`}
            className="text-gold-500 hover:text-gold-400 text-sm font-heading uppercase tracking-wider transition-colors whitespace-nowrap"
          >
            View Order &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
