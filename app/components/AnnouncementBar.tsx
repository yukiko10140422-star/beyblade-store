import {useRouteLoaderData} from 'react-router';
import {
  DUTIES,
  dutiesIncludedFor,
  EXPRESS_PROMO_LIVE,
  EXPRESS_UPGRADE,
  freeStandardTo,
} from '~/lib/shipping';

/**
 * One static line of facts that hold for every product (no rotation).
 * The Express offer is added only when EXPRESS_PROMO_LIVE (shipping.ts).
 */
export function AnnouncementBar() {
  const {subtotalThreshold, quantityThreshold, maxShippingValue} =
    EXPRESS_UPGRADE;
  // Only for a known country whose standard shipping is free at checkout.
  const root = useRouteLoaderData('root') as
    | {buyerCountry?: string | null}
    | undefined;
  const freeTo = freeStandardTo(root?.buyerCountry);
  return (
    <div className="bg-[#1B2230] px-4 py-2 text-center text-[13px] text-white">
      {freeTo
        ? `Free tracked shipping to ${freeTo}`
        : 'Ships from Japan with tracking'}
      {DUTIES.included &&
        dutiesIncludedFor(root?.buyerCountry) &&
        ' · Duties included'}
      {EXPRESS_PROMO_LIVE && (
        <span className="hidden md:inline">
          {' '}
          · Free Express upgrade on US${subtotalThreshold}+ or{' '}
          {quantityThreshold}+ items (shipping rates up to US${maxShippingValue})
        </span>
      )}
    </div>
  );
}
