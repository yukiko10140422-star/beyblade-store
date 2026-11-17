import {DUTIES, EXPRESS_PROMO_LIVE, EXPRESS_UPGRADE} from '~/lib/shipping';

/**
 * One static line of facts that hold for every product (no rotation).
 * The Express offer is added only when EXPRESS_PROMO_LIVE (shipping.ts).
 */
export function AnnouncementBar() {
  const {subtotalThreshold, quantityThreshold, maxShippingValue} =
    EXPRESS_UPGRADE;
  return (
    <div className="bg-[#1B2230] px-4 py-2 text-center text-[13px] text-white">
      Ships from Japan with tracking{DUTIES.included && ' · Duties included'}
      {EXPRESS_PROMO_LIVE && (
        <span className="hidden md:inline">
          {' '}
          · Free Express upgrade on US${subtotalThreshold}+ or{' '}
          {quantityThreshold}+ items (up to US${maxShippingValue})
        </span>
      )}
    </div>
  );
}
