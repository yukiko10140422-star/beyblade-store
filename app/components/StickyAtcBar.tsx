import {Money} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useEffect, useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

type SelectedVariant = NonNullable<
  ProductFragment['selectedOrFirstAvailableVariant']
>;

interface StickyAtcBarProps {
  /** Pre-order items say so on the button. */
  isPreOrder?: boolean;
  /** The buyer's country is not shipped to: the button is off. */
  blocked?: boolean;
  selectedVariant: SelectedVariant | null | undefined;
  productTitle: string;
  productImage?: {
    url: string;
    altText?: string | null;
  } | null;
}

/**
 * Mobile sticky Add-to-cart bar.
 * Visible whenever the primary Add-to-cart (marked `data-primary-atc` on the
 * product page) is NOT on screen — including on first load, when the large
 * photo pushes the primary button below the fold on phones.
 * Hidden on desktop (lg+), where the primary button sits near the top.
 */
export function StickyAtcBar({
  isPreOrder = false,
  blocked = false,
  selectedVariant,
  productTitle,
  productImage,
}: StickyAtcBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector('[data-primary-atc]');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      {threshold: 0},
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  if (!selectedVariant) return null;

  return (
    <div
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-vault-900 border-t border-vault-700 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="region"
      aria-label="Quick purchase"
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {productImage && (
          <img
            src={productImage.url}
            alt={productImage.altText || productTitle}
            className="w-12 h-12 rounded-[4px] object-contain bg-vault-800 border border-vault-700 flex-shrink-0"
            loading="lazy"
            width={48}
            height={48}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-vault-50 text-xs font-semibold line-clamp-1">
            {productTitle}
          </p>
          <Money
            data={selectedVariant.price}
            className="text-vault-50 font-display text-base font-semibold"
          />
        </div>
        <AddToCartButton
          disabled={blocked || (!selectedVariant.availableForSale && !isPreOrder)}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity: 1,
              selectedVariant,
            },
          ]}
          className="bg-holo-500 hover:bg-holo-600 text-white font-heading font-semibold text-xs px-5 py-3 rounded-[4px] transition-colors whitespace-nowrap disabled:bg-vault-700 disabled:text-chrome-500 disabled:cursor-not-allowed"
        >
          {isPreOrder
            ? 'Pre-order now'
            : selectedVariant.availableForSale
              ? 'Add to Cart'
              : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}
