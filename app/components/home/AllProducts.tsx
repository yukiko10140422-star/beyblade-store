import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {Reveal} from '~/components/motion';
import {ProductCardSkeleton} from './ProductCardSkeleton';

interface AllProductsProps {
  products: Promise<RecommendedProductsQuery | null>;
}

export function AllProducts({products}: AllProductsProps) {
  return (
    <section id="products" className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider">
                All Products
              </h2>
              <p className="text-chrome-500 text-sm mt-2">
                Rare, limited, and pre-order items from Japan
              </p>
            </div>
            <Link
              to="/collections/all"
              className="text-gold-500 hover:text-gold-400 font-heading text-xs uppercase tracking-wider transition-colors"
            >
              Browse All &rarr;
            </Link>
          </div>
        </Reveal>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({length: 12}).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Await resolve={products}>
            {(response) => {
              const nodes = response?.products?.nodes;
              if (!nodes || nodes.length === 0) {
                return (
                  <p className="text-chrome-500 text-sm text-center py-8">
                    Products are temporarily unavailable. Please check back
                    soon.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {nodes.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={i < 8 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
