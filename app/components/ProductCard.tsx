import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {parseHandlingDays} from '~/lib/delivery-estimate';
import {handlingLabel} from '~/lib/shipping';

type MetaValue = {value: string} | null | undefined;

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
    featuredImage?: {
      id?: string | null;
      altText?: string | null;
      url: string;
      width?: number | null;
      height?: number | null;
    } | null;
    tags?: string[] | null;
    modelNumber?: MetaValue;
    series?: MetaValue;
    handlingDays?: MetaValue;
  };
  loading?: 'eager' | 'lazy';
}

/**
 * Product tile: white surface, thin rule, no shadow.
 * Square photo → model number (mono, accent) · series → name → price →
 * dispatch time when known (or "Pre-order").
 */
export function ProductCard({product, loading}: ProductCardProps) {
  const isPreOrder = product.tags?.some((t) => t.toLowerCase() === 'pre-order');
  const model = product.modelNumber?.value?.trim();
  const series = product.series?.value?.trim();
  const handling = parseHandlingDays(product.handlingDays?.value);

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group flex flex-col overflow-hidden rounded-[4px] border border-vault-700 bg-white hover:border-holo-500"
    >
      <div className="aspect-square border-b border-vault-700 bg-white">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="1/1"
            sizes="(min-width: 1024px) 25vw, 50vw"
            loading={loading}
            alt={product.featuredImage.altText || product.title}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-chrome-600">
            No photo yet
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-2.5 pb-3 pt-2 md:px-3.5 md:pb-3.5 md:pt-3">
        {(model || series) && (
          <span className="text-xs text-chrome-400">
            {model && (
              <span className="font-mono text-[12.5px] font-medium text-holo-500">
                {model}
              </span>
            )}
            {model && series && ' · '}
            {series}
          </span>
        )}
        <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-chrome-200 md:text-sm">
          {product.title}
        </span>
        <Money
          data={product.priceRange.minVariantPrice}
          className="mt-1.5 text-sm font-bold text-chrome-200 md:text-base"
        />
        {isPreOrder ? (
          <span className="text-xs text-chrome-400">
            Pre-order · release date on page
          </span>
        ) : (
          handling != null && (
            <span className="text-xs text-holo-500">
              {handlingLabel(handling)}
            </span>
          )
        )}
      </div>
    </Link>
  );
}
