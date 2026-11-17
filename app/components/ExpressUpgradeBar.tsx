import {EXPRESS_PROMO_LIVE, EXPRESS_UPGRADE} from '~/lib/shipping';

interface ExpressUpgradeBarProps {
  subtotal: number;
  currencyCode: string | undefined;
  quantity: number;
}

/**
 * Cart nudge for the store-wide free Express discount. Rendered only when
 * EXPRESS_PROMO_LIVE (the offer is being redesigned). The money threshold
 * is in USD; other currencies see the item-count path only.
 */
export function ExpressUpgradeBar({
  subtotal,
  currencyCode,
  quantity,
}: ExpressUpgradeBarProps) {
  if (!EXPRESS_PROMO_LIVE) return null;
  const {subtotalThreshold, quantityThreshold, maxShippingValue} =
    EXPRESS_UPGRADE;
  const isUsd = currencyCode === EXPRESS_UPGRADE.currency;
  const amountLeft = isUsd ? subtotalThreshold - subtotal : Infinity;
  const itemsLeft = quantityThreshold - quantity;
  const qualified = amountLeft <= 0 || itemsLeft <= 0;
  const progress = Math.max(
    isUsd ? Math.min((subtotal / subtotalThreshold) * 100, 100) : 0,
    Math.min((quantity / quantityThreshold) * 100, 100),
  );

  return (
    <div className="border-t border-vault-700 px-1 py-4" aria-live="polite">
      <p className="mb-2 text-center text-[13px] text-chrome-300">
        {qualified
          ? 'Your order qualifies for a free Express upgrade. It is applied at checkout.'
          : `Add ${isUsd ? `US$${amountLeft.toFixed(2)} or ` : ''}${itemsLeft} more item${itemsLeft === 1 ? '' : 's'} for a free Express upgrade (up to US$${maxShippingValue} shipping value).`}
      </p>
      {!qualified && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-vault-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Progress to free Express upgrade"
        >
          <div
            className="h-full rounded-full bg-holo-500"
            style={{width: `${progress}%`}}
          />
        </div>
      )}
    </div>
  );
}
