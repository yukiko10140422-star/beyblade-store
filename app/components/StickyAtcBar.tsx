import {Money} from '@shopify/hydrogen';
import {AddToCartButton} from './AddToCartButton';
import {useEffect, useState} from 'react';
import type {ProductFragment} from 'storefrontapi.generated';

type SelectedVariant = NonNullable<
  ProductFragment['selectedOrFirstAvailableVariant']
>;

interface StickyAtcBarProps {
  selectedVariant: SelectedVariant | null | undefined;
  productTitle: string;
  productImage?: {
    url: string;
    altText?: string | null;
  } | null;
}

/**
 * Mobile sticky ATC bar — appears below the fold on PDP.
 * Industry data: 8-15% conversion lift on mobile, up to 25% on PDP scroll.
 * Hidden on desktop (lg+) where the regular ATC is always visible in the
 * sticky right column.
 */
export function StickyAtcBar({
  selectedVariant,
  productTitle,
  productImage,
}: StickyAtcBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Show after scrolling past ~600px (below the main ATC)
          setVisible(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!selectedVariant) return null;

  return (
    <div
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-vault-700 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
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
            className="w-12 h-12 rounded-lg object-contain bg-vault-800 border border-vault-700 flex-shrink-0"
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
          disabled={!selectedVariant.availableForSale}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity: 1,
              selectedVariant,
            },
          ]}
          className="bg-vermillion-500 hover:bg-vermillion-600 text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-full transition-colors whitespace-nowrap disabled:bg-vault-700 disabled:text-chrome-500 disabled:cursor-not-allowed"
        >
          {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </AddToCartButton>
      </div>
    </div>
  );
}
