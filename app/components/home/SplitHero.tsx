import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Reveal} from '~/components/motion';
import {ShieldCheckIcon, GlobeIcon, CheckCircleIcon} from '~/components/icons';

interface FeaturedProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    id?: string | null;
    altText?: string | null;
    url: string;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface SplitHeroProps {
  product: FeaturedProduct | null | undefined;
}

/**
 * Split-hero pattern (60/40) — converts ~17% better than full-bleed video
 * for cold paid traffic in collectible/toy categories. Spotlights one
 * featured product (Aero Pegasus RED) with clear value prop + CTA.
 */
export function SplitHero({product}: SplitHeroProps) {
  if (!product) {
    return <FallbackHero />;
  }

  const price = Number(product.priceRange.minVariantPrice.amount);

  return (
    <section className="bg-vault-950 paper-grain">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Product image — left 60% on desktop */}
          <Reveal className="lg:col-span-7">
            <Link
              to={`/products/${product.handle}`}
              prefetch="intent"
              className="block relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-vault-700 group"
            >
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  aspectRatio="4/3"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  loading="eager"
                  className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-[1.02]"
                />
              )}
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-vermillion-500 text-white text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                This Week&rsquo;s Drop
              </span>
            </Link>
          </Reveal>

          {/* Headline + CTA — right 40% */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Reveal>
              <p className="text-vermillion-500 font-heading text-xs uppercase tracking-[0.2em] font-semibold mb-3">
                Authentic · Tokyo · DDP
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-vault-50 leading-[1.05] tracking-tight">
                Authentic Beyblade X
                <span className="block text-chrome-300 italic font-medium">
                  shipped from Tokyo.
                </span>
              </h1>
              <p className="text-chrome-400 text-base md:text-lg leading-relaxed mt-5 max-w-md">
                Sourced direct from Takara Tomy retailers in Japan. Free
                worldwide shipping. All duties pre-paid.
              </p>
            </Reveal>

            <Reveal>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link
                  to={`/products/${product.handle}`}
                  prefetch="intent"
                  className="inline-flex items-center justify-center gap-2 bg-vermillion-500 hover:bg-vermillion-600 text-white font-heading font-semibold text-sm uppercase tracking-wider px-7 py-4 rounded-full transition-all hover:shadow-lg hover:shadow-vermillion-500/25"
                >
                  Shop Featured · ${price.toFixed(0)}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/collections/all-beyblades"
                  prefetch="intent"
                  className="inline-flex items-center justify-center font-heading font-semibold text-sm uppercase tracking-wider px-7 py-4 rounded-full border border-vault-600 text-vault-50 hover:border-vault-50 hover:bg-vault-800 transition-all"
                >
                  Browse All
                </Link>
              </div>
            </Reveal>

            {/* Trust strip — direct address to top conversion blocker */}
            <Reveal>
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-vault-700">
                <div className="flex flex-col items-start gap-1.5">
                  <ShieldCheckIcon className="w-5 h-5 text-vermillion-500" />
                  <span className="text-vault-50 text-xs font-semibold">
                    Authentic
                  </span>
                  <span className="text-chrome-500 text-[10px] uppercase tracking-wider">
                    Takara Tomy
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <CheckCircleIcon className="w-5 h-5 text-vermillion-500" />
                  <span className="text-vault-50 text-xs font-semibold">
                    DDP
                  </span>
                  <span className="text-chrome-500 text-[10px] uppercase tracking-wider">
                    Duties Included
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <GlobeIcon className="w-5 h-5 text-vermillion-500" />
                  <span className="text-vault-50 text-xs font-semibold">
                    Free Ship
                  </span>
                  <span className="text-chrome-500 text-[10px] uppercase tracking-wider">
                    Worldwide
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Social proof bar — leverages NinJapon eBay track record */}
        <Reveal>
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-chrome-400 text-xs md:text-sm">
            <span className="flex items-center gap-2">
              <span className="text-vermillion-500 font-display text-base font-semibold">
                3,800+
              </span>
              international shipments via NinJapon
            </span>
            <span className="text-vault-600 hidden md:inline">·</span>
            <span>Ships from Tokyo within 24h</span>
            <span className="text-vault-600 hidden md:inline">·</span>
            <span>Trusted Japanese exporter since 2023</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FallbackHero() {
  return (
    <section className="bg-vault-950 paper-grain">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-vault-50 leading-tight">
          Authentic Beyblade X
          <span className="block text-chrome-300 italic">
            shipped from Tokyo.
          </span>
        </h1>
        <Link
          to="/collections/all-beyblades"
          className="inline-block mt-8 bg-vermillion-500 hover:bg-vermillion-600 text-white font-heading font-semibold uppercase tracking-wider px-7 py-4 rounded-full transition-all"
        >
          Shop All
        </Link>
      </div>
    </section>
  );
}
