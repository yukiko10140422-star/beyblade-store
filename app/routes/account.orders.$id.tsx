import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-heading text-2xl text-gold-400 uppercase tracking-wider">
          Order {order.name}
        </h2>
        <p className="text-chrome-500 text-sm">
          Placed on {new Date(order.processedAt!).toDateString()}
        </p>
        {order.confirmationNumber && (
          <p className="text-chrome-600 text-xs">
            Confirmation: {order.confirmationNumber}
          </p>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-vault-800 border border-vault-700 rounded-lg overflow-hidden">
        {/* Table header - hidden on mobile, visible on sm+ */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-vault-700">
          <span className="text-chrome-600 text-[10px] uppercase tracking-wider font-heading">
            Product
          </span>
          <span className="text-chrome-600 text-[10px] uppercase tracking-wider font-heading w-24 text-right">
            Price
          </span>
          <span className="text-chrome-600 text-[10px] uppercase tracking-wider font-heading w-16 text-center">
            Qty
          </span>
          <span className="text-chrome-600 text-[10px] uppercase tracking-wider font-heading w-24 text-right">
            Total
          </span>
        </div>

        {/* Line item rows */}
        <div className="divide-y divide-vault-700">
          {lineItems.map((lineItem, lineItemIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-vault-600 px-4 py-4 space-y-2">
          {((discountValue && discountValue.amount) || discountPercentage) && (
            <div className="flex justify-between items-center">
              <span className="text-chrome-400 text-sm">Discounts</span>
              <span className="text-green-400 text-sm font-heading">
                {discountPercentage ? (
                  <span>-{discountPercentage}% OFF</span>
                ) : (
                  discountValue && <Money data={discountValue!} />
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-chrome-400 text-sm">Subtotal</span>
            <span className="text-chrome-200 text-sm">
              <Money data={order.subtotal!} />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-chrome-400 text-sm">Tax</span>
            <span className="text-chrome-200 text-sm">
              <Money data={order.totalTax!} />
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-vault-700">
            <span className="text-chrome-200 font-heading uppercase tracking-wider text-sm">
              Total
            </span>
            <span className="text-gold-400 font-heading text-lg">
              <Money data={order.totalPrice!} />
            </span>
          </div>
        </div>
      </div>

      {/* Shipping & Status sidebar */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-vault-800 border border-vault-700 rounded-lg p-4 space-y-2">
          <h3 className="font-heading text-xs text-chrome-600 uppercase tracking-wider mb-3">
            Shipping Address
          </h3>
          {order?.shippingAddress ? (
            <address className="not-italic space-y-1 text-chrome-300 text-sm">
              <p className="text-chrome-200 font-medium">
                {order.shippingAddress.name}
              </p>
              {order.shippingAddress.formatted && (
                <p>{order.shippingAddress.formatted}</p>
              )}
              {order.shippingAddress.formattedArea && (
                <p>{order.shippingAddress.formattedArea}</p>
              )}
            </address>
          ) : (
            <p className="text-chrome-500 text-sm">
              No shipping address defined
            </p>
          )}
        </div>

        <div className="bg-vault-800 border border-vault-700 rounded-lg p-4 space-y-2">
          <h3 className="font-heading text-xs text-chrome-600 uppercase tracking-wider mb-3">
            Fulfillment Status
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded text-xs uppercase tracking-wider font-heading ${
              fulfillmentStatus === 'SUCCESS' ||
              fulfillmentStatus === 'DELIVERED'
                ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                : 'bg-chrome-500/10 text-chrome-400 border border-chrome-500/20'
            }`}
          >
            {fulfillmentStatus}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          target="_blank"
          href={order.statusPageUrl}
          rel="noreferrer"
          className="text-gold-500 hover:text-gold-400 font-heading uppercase tracking-wider text-sm transition-colors"
        >
          View Order Status &rarr;
        </a>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-center px-4 py-3">
      {/* Product */}
      <div className="flex items-center gap-3">
        {lineItem?.image && (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-vault-900 border border-vault-700 flex-shrink-0">
            <Image
              data={lineItem.image}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-chrome-200 text-sm leading-snug truncate">
            {lineItem.title}
          </p>
          {lineItem.variantTitle && (
            <span className="text-chrome-500 text-xs">
              {lineItem.variantTitle}
            </span>
          )}
        </div>
      </div>

      {/* Price / Qty / Total - inline on mobile, grid cells on sm+ */}
      <div className="flex sm:contents gap-4 pl-[76px] sm:pl-0 text-sm">
        <span className="sm:w-24 sm:text-right text-chrome-300">
          <Money data={lineItem.price!} />
        </span>
        <span className="sm:w-16 sm:text-center text-chrome-400">
          <span className="sm:hidden text-chrome-600 mr-1">&times;</span>
          {lineItem.quantity}
        </span>
        <span className="sm:w-24 sm:text-right text-gold-400 font-heading">
          {lineItem.price ? (
            <Money
              data={{
                amount: String(
                  parseFloat(lineItem.price.amount) * lineItem.quantity,
                ),
                currencyCode: lineItem.price.currencyCode,
              }}
            />
          ) : (
            '—'
          )}
        </span>
      </div>
    </div>
  );
}
