import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {Reveal} from '~/components/motion';
import {ProductCardSkeleton} from './ProductCardSkeleton';

interface NewArrivalsProps {
  products: Promise<RecommendedProductsQuery | null>;
}

export function NewArrivals({products}: NewArrivalsProps) {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider">
                New Arrivals
              </h2>
              <p className="text-chrome-500 text-sm mt-2">Fresh from Tokyo</p>
            </div>
            <Link
              to="/collections/all"
              className="text-gold-500 hover:text-gold-400 font-heading text-xs uppercase tracking-wider transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
        </Reveal>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({length: 4}).map((_, i) => (
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {nodes.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={i < 4 ? 'eager' : 'lazy'}
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
