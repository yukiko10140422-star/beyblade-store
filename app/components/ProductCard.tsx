import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {TypeBadge} from './TypeBadge';
import {ImagePlaceholderIcon} from '~/components/icons';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
    // Match the subset returned by PRODUCT_ITEM_FRAGMENT
    featuredImage?: {
      id?: string | null;
      altText?: string | null;
      url: string;
      width?: number | null;
      height?: number | null;
    } | null;
    vendor?: string | null;
    beybladeType?: {value: string} | null;
    tags?: string[] | null;
  };
  loading?: 'eager' | 'lazy';
}

export function ProductCard({product, loading}: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group relative bg-white rounded-xl overflow-hidden border border-vault-700 transition-all duration-300 hover:border-vermillion-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-vault-800">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="1/1"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            loading={loading}
            className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlaceholderIcon className="w-12 h-12 text-vault-600" />
          </div>
        )}
      </div>

      {/* Availability Badge */}
      {product.tags && (
        <div className="absolute top-2 left-2 z-10">
          <TypeBadge tags={product.tags.join(', ')} />
        </div>
      )}

      {/* Info */}
      <div className="p-4 border-t border-vault-700">
        {product.vendor && (
          <p className="text-chrome-500 text-[10px] font-heading uppercase tracking-widest mb-1.5 font-semibold">
            {product.vendor}
          </p>
        )}
        <h3 className="font-body text-sm font-medium text-vault-50 line-clamp-2 group-hover:text-vermillion-500 transition-colors min-h-[2.8em] leading-snug">
          {product.title}
        </h3>
        <div className="mt-3 flex items-baseline justify-between">
          <Money
            data={product.priceRange.minVariantPrice}
            className="text-vault-50 font-display text-lg font-semibold"
          />
          <span className="text-chrome-500 text-[10px] uppercase tracking-wider">
            Free Ship
          </span>
        </div>
      </div>
    </Link>
  );
}
