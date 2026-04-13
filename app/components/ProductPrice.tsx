import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div aria-label="Price" className="flex items-baseline gap-3" role="group">
      {compareAtPrice ? (
        <>
          {price ? (
            <Money
              data={price}
              className="text-gold-400 font-heading text-2xl"
            />
          ) : null}
          <s>
            <Money
              data={compareAtPrice}
              className="text-chrome-600 font-heading text-base"
            />
          </s>
          <span className="text-[10px] font-heading uppercase tracking-wider bg-danger-500/20 text-danger-500 border border-danger-500/30 px-2 py-0.5 rounded-full">
            Sale
          </span>
        </>
      ) : price ? (
        <Money data={price} className="text-gold-400 font-heading text-2xl" />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
