import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {arrivalAround, type DeliveryEstimate} from '~/lib/delivery-estimate';
import {EXPRESS_OPTIONS, RETURNS, SHIPPING_METHODS} from '~/lib/shipping';

/**
 * Stock line next to the price.
 * - item held in Japan (`shipping.in_hand`) with a known quantity:
 *   "Only 1 left" / "3 available"
 * - otherwise, purchasable: "Available" (no count)
 * - pre-order / sold out: nothing (the button says it)
 */
export function StockNote({
  quantity,
  available,
  isPreOrder,
  inHand,
}: {
  quantity: Promise<number | null>;
  available: boolean;
  isPreOrder: boolean;
  inHand: boolean;
}) {
  if (!available || isPreOrder) return null;
  const cls = 'text-sm font-semibold text-holo-500';
  return (
    <Suspense fallback={null}>
      <Await resolve={quantity} errorElement={null}>
        {(q) => {
          if (q == null || !inHand)
            return <span className={cls}>Available</span>;
          if (q <= 0) return null;
          return (
            <span className={cls}>
              {q === 1 ? 'Only 1 left' : `${q} available`}
            </span>
          );
        }}
      </Await>
    </Suspense>
  );
}

/**
 * Shipping rows under Add to cart. Every figure comes from
 * ~/lib/shipping (Japan Post's published tables) and the product's own
 * `shipping.handling_days`. Rows with unknown values are not rendered.
 */
export function DeliveryBox({
  estimate,
  handlingDays,
}: {
  estimate: DeliveryEstimate;
  handlingDays: number | null;
}) {
  const s = estimate.standard;
  return (
    <div className="flex flex-col gap-2 border-t border-vault-700 pt-3.5 text-sm">
      {estimate.handlingLabel && (
        <Row icon={<TruckIcon />}>
          <b className="font-semibold text-chrome-200">
            {estimate.handlingLabel}
          </b>{' '}
          from Japan, with tracking.
        </Row>
      )}
      <Row icon={<CalendarIcon />}>
        <span>
          Standard: {s.methodLabel}
          {s.transitDays != null && (
            <>
              {' '}
              — about {s.transitDays} days to {estimate.destination} after
              dispatch (Japan Post standard)
            </>
          )}
          .
          {s.around && (
            <>
              {' '}
              Estimated delivery:{' '}
              <b className="font-semibold text-chrome-200">{s.around}</b>.
            </>
          )}
        </span>
      </Row>
      {EXPRESS_OPTIONS.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 pl-[30px]">
          {EXPRESS_OPTIONS.map((o) => {
            const transit =
              o.method === 'ems' ? estimate.emsTransitDays : s.transitDays;
            const around = arrivalAround(o.handlingDays, transit);
            return (
              <li key={o.label}>
                <b className="font-semibold text-chrome-200">{o.label}</b>:{' '}
                {SHIPPING_METHODS[o.method].label}, {o.price}, ships within{' '}
                {o.handlingDays} business days
                {around ? `, estimated delivery ${around}` : ''}.
              </li>
            );
          })}
        </ul>
      )}
      <Row icon={<ReturnIcon />}>
        <span>
          Shipping options and costs for your country are shown at checkout,
          before you pay.{' '}
          <Link to="/shipping" className="text-holo-500 hover:underline">
            Shipping
          </Link>
        </span>
      </Row>
    </div>
  );
}

/** Returns line — only for factory-sealed items (decided in the brief). */
export function ReturnsNote() {
  return (
    <p className="m-0 text-[13px] text-chrome-400">
      {RETURNS.summary}{' '}
      <Link to="/returns" className="text-holo-500 hover:underline">
        Returns
      </Link>
    </p>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0 text-chrome-200">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

const svg = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  'aria-hidden': true,
} as const;

function TruckIcon() {
  return (
    <svg {...svg}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg {...svg}>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg {...svg}>
      <path d="M4 12a8 8 0 1 0 3-6.2" />
      <path d="M4 4v4h4" />
    </svg>
  );
}
