import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  MoneyV2,
  Image as ImageType,
} from '@shopify/hydrogen/storefront-api-types';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    priceRange: {
      minVariantPrice: MoneyV2;
    };
    featuredImage?: ImageType | null;
    vendor?: string;
  };
  loading?: 'eager' | 'lazy';
}

export function ProductCard({product, loading}: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group relative surface-vault rounded-xl overflow-hidden transition-all duration-300 hover:border-gold-400/30 hover:glow-gold-sm"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-vault-800">
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="1/1"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            loading={loading}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-vault-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.vendor && (
          <p className="text-chrome-600 text-[10px] font-heading uppercase tracking-widest mb-1">
            {product.vendor}
          </p>
        )}
        <h3 className="font-heading text-xs uppercase tracking-wider text-chrome-200 line-clamp-2 group-hover:text-gold-400 transition-colors min-h-[2.5em]">
          {product.title}
        </h3>
        <div className="mt-2">
          <Money
            data={product.priceRange.minVariantPrice}
            className="text-gold-400 font-heading text-sm"
          />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-vault-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-gold-400 border border-gold-400/50 px-4 py-2 rounded-full backdrop-blur-sm">
          View Details
        </span>
      </div>
    </Link>
  );
}
