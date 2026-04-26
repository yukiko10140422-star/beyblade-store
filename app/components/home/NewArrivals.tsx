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
    <section className="py-16 md:py-24 px-4 bg-vault-950">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <p className="text-vermillion-500 font-heading text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">
                Fresh from Tokyo
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-vault-50 tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/collections/all-beyblades"
              className="text-vermillion-500 hover:text-vermillion-600 font-heading text-xs uppercase tracking-wider font-semibold transition-colors"
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
                  <p className="text-chrome-400 text-sm text-center py-8">
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
