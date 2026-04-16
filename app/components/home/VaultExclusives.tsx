import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {Reveal} from '~/components/motion';
import {ProductCardSkeleton} from './ProductCardSkeleton';
import {LockOpenIcon} from '~/components/icons';

interface VaultExclusivesProps {
  products: Promise<RecommendedProductsQuery | null>;
}

export function VaultExclusives({products}: VaultExclusivesProps) {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,215,0,0.03)_0%,_transparent_60%)]" />
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-12">
            <LockOpenIcon className="w-7 h-7 text-gold-400" />
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider">
                Vault Exclusives
              </h2>
              <p className="text-chrome-500 text-sm mt-1">
                Limited releases & rare collector pieces
              </p>
            </div>
          </div>
        </Reveal>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({length: 3}).map((_, i) => (
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
                    Exclusive items are temporarily unavailable.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {nodes.slice(0, 3).map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.handle}`}
                      prefetch="intent"
                      className="group relative surface-vault rounded-xl overflow-hidden border-gold-400/20 transition-all duration-300 hover:glow-gold-md flex flex-row md:flex-col"
                    >
                      <div className="w-1/3 md:w-full aspect-square md:aspect-video overflow-hidden bg-vault-800 flex-shrink-0">
                        {product.featuredImage && (
                          <Image
                            data={product.featuredImage}
                            aspectRatio="16/9"
                            sizes="(min-width: 768px) 33vw, 100vw"
                            loading="lazy"
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-center">
                        <span className="inline-block self-start text-[9px] font-heading uppercase tracking-widest bg-danger-500/20 text-danger-500 border border-danger-500/30 px-2 py-0.5 rounded-full mb-2">
                          Exclusive
                        </span>
                        <h3 className="font-heading text-xs uppercase tracking-wider text-chrome-200 group-hover:text-gold-400 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-gold-400 font-heading text-sm mt-2">
                          $
                          {Number(
                            product.priceRange.minVariantPrice.amount,
                          ).toFixed(2)}
                        </p>
                      </div>
                    </Link>
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
