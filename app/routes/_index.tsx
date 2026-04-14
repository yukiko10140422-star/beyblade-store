import {Await, useLoaderData, Link, useFetcher} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useRef, useEffect} from 'react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {ProductCard} from '~/components/ProductCard';
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
  FloatingParticles,
  GlowOrb,
  motion,
} from '~/components/motion';

export const meta: Route.MetaFunction = () => {
  const title = 'Tokyo Spin Vault | Authentic Beyblades from Japan';
  const description =
    'Premium authentic Beyblades sourced direct from Japan. Rare finds, exclusive drops, collector grade. Ships worldwide from Tokyo.';
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:image', content: '/images/logo.png'},
    {property: 'og:site_name', content: 'Tokyo Spin Vault'},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <HeroSection />
      <NewArrivals products={data.recommendedProducts} />
      <TypeCategories />
      <TrustSignals />
      <VaultExclusives products={data.recommendedProducts} />
      <ShippingBanner />
      <Newsletter />
    </div>
  );
}

/* --- Section 1: Hero --- */
function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-vault-950">
      {/* Tokyo night skyline background */}
      <div className="absolute inset-0">
        <img
          src="/images/tokyo-night.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-vault-950/80 to-vault-950/60" />
      </div>

      {/* Ambient glow orbs */}
      <GlowOrb className="w-96 h-96 bg-gold-400/10 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb className="w-64 h-64 bg-electric-500/5 bottom-1/4 right-1/4" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.06)_0%,_transparent_50%)]" />

      {/* Rotating rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-gold-400/[0.08]"
          animate={{rotate: 360}}
          transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-gold-400/[0.05]"
          animate={{rotate: -360}}
          transition={{duration: 15, repeat: Infinity, ease: 'linear'}}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-gold-400/[0.03]"
          animate={{rotate: 360}}
          transition={{duration: 25, repeat: Infinity, ease: 'linear'}}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.img
          src="/images/logo-transparent.png"
          alt="Tokyo Spin Vault"
          className="mx-auto h-32 md:h-52 w-auto mb-6 drop-shadow-[0_0_40px_rgba(255,215,0,0.4)] mix-blend-screen"
          initial={{opacity: 0, scale: 0.8, y: 20}}
          animate={{opacity: 1, scale: 1, y: 0}}
          transition={{duration: 1, ease: [0.16, 1, 0.3, 1]}}
        />

        <motion.h1
          className="font-heading text-3xl md:text-5xl lg:text-6xl text-gold-metallic uppercase tracking-wider mb-4"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1]}}
        >
          Enter the Vault
        </motion.h1>

        <motion.p
          className="text-chrome-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1]}}
        >
          Premium authentic Beyblades, sourced direct from Japan.
          <br className="hidden md:block" />
          Rare finds. Exclusive drops. Collector grade.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1]}}
        >
          <Link
            to="/collections/all"
            className="group inline-flex items-center gap-3 bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading uppercase tracking-[0.2em] text-xs md:text-sm px-8 py-4 rounded-lg transition-all duration-300 hover:glow-gold-lg"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Enter the Vault
          </Link>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 border border-vault-600 hover:border-gold-400/30 text-chrome-300 hover:text-gold-400 font-heading uppercase tracking-[0.2em] text-xs md:text-sm px-8 py-4 rounded-lg transition-all duration-300"
          >
            Browse Collections
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{y: [0, 8, 0]}}
        transition={{duration: 2, repeat: Infinity, ease: 'easeInOut'}}
      >
        <svg
          className="w-5 h-5 text-gold-400/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </motion.div>
    </section>
  );
}

/* --- Section 2: New Arrivals --- */
function NewArrivals({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
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
            {(response) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {response?.products.nodes.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/* --- Section 3: Choose Your Type --- */
function TypeCategories() {
  const types = [
    {
      name: 'Attack',
      description: 'Speed & Power',
      color: 'from-blue-500/20',
      text: 'text-bey-attack',
      border: 'bg-bey-attack',
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'Defense',
      description: 'Solid & Unyielding',
      color: 'from-green-500/20',
      text: 'text-bey-defense',
      border: 'bg-bey-defense',
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Stamina',
      description: 'Endurance & Spin',
      color: 'from-orange-500/20',
      text: 'text-bey-stamina',
      border: 'bg-bey-stamina',
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Balance',
      description: 'Versatile & Adaptive',
      color: 'from-red-500/20',
      text: 'text-bey-balance',
      border: 'bg-bey-balance',
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-vault-950">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider text-center mb-3">
            Choose Your Type
          </h2>
          <p className="text-chrome-500 text-sm text-center mb-12">
            Every blade has its destiny
          </p>
        </Reveal>
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {types.map((type) => (
            <StaggerItem key={type.name}>
              <Link
                to={`/collections/${type.name.toLowerCase()}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden surface-vault transition-all duration-300 hover:glow-gold-sm block"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${type.color} to-transparent opacity-30 group-hover:opacity-50 transition-opacity`}
                />
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className={`mb-4 ${type.text}`}>{type.icon}</div>
                  <h3
                    className={`font-heading text-lg uppercase tracking-wider ${type.text}`}
                  >
                    {type.name}
                  </h3>
                  <p className="text-chrome-500 text-xs mt-2">
                    {type.description}
                  </p>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${type.border} opacity-40 group-hover:opacity-100 transition-opacity`}
                />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* --- Section 4: Trust Signals --- */
function TrustSignals() {
  const signals = [
    {
      title: 'Japan Direct',
      description: 'Sourced & shipped from Tokyo',
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
    },
    {
      title: '100% Authentic',
      description: 'Genuine Takara Tomy only',
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Collector Grade',
      description: 'Carefully inspected & packed',
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      title: 'Worldwide Shipping',
      description: 'Tracked EMS to 50+ countries',
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-10 border-y border-vault-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((s) => (
            <StaggerItem
              key={s.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="text-gold-400">{s.icon}</div>
              <h3 className="font-heading text-[11px] uppercase tracking-[0.15em] text-chrome-200">
                {s.title}
              </h3>
              <p className="text-chrome-500 text-xs">{s.description}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* --- Section 5: Vault Exclusives --- */
function VaultExclusives({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,215,0,0.03)_0%,_transparent_60%)]" />
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="flex items-center gap-4 mb-12">
            <svg
              className="w-7 h-7 text-gold-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
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
            {(response) => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {response?.products.nodes.slice(0, 3).map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.handle}`}
                    prefetch="intent"
                    className="group relative surface-vault rounded-xl overflow-hidden border-gold-400/20 transition-all duration-300 hover:glow-gold-md flex flex-row md:flex-col"
                  >
                    <div className="w-1/3 md:w-full aspect-square md:aspect-video overflow-hidden bg-vault-800 flex-shrink-0">
                      {product.featuredImage && (
                        <img
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
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
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/* --- Section 6: Shipping Banner --- */
function ShippingBanner() {
  const items = [
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      text: 'Ships from Tokyo via EMS',
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      text: 'Insured & Tracked Worldwide',
    },
    {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: '5-10 Business Days Delivery',
    },
  ];

  return (
    <section className="py-6 bg-vault-800/30 border-y border-vault-700/30">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && (
              <div className="hidden md:block w-px h-5 bg-vault-600 -ml-6 mr-3" />
            )}
            <span className="text-gold-400">{item.icon}</span>
            <span className="text-chrome-300 text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- Section 7: Newsletter --- */
function Newsletter() {
  const fetcher = useFetcher<{
    success?: boolean;
    message?: string;
    error?: string;
  }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success;

  useEffect(() => {
    if (isSuccess && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [isSuccess]);

  return (
    <section className="py-16 md:py-24 px-4">
      <Reveal>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider mb-4">
            Vault Access
          </h2>
          <p className="text-chrome-400 text-sm md:text-base mb-8">
            Get early access to drops, exclusive releases, and collector
            insights. Direct from Tokyo.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-gold-400/10 border border-gold-400/20 max-w-md mx-auto">
              <svg
                className="w-5 h-5 text-gold-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gold-400 text-sm font-heading uppercase tracking-wider">
                {fetcher.data?.message || 'Welcome to the Vault!'}
              </p>
            </div>
          ) : (
            <fetcher.Form
              method="post"
              action="/api/newsletter"
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                ref={inputRef}
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 bg-vault-800 border border-vault-700 rounded-lg px-4 py-3 text-sm text-chrome-200 placeholder:text-chrome-600 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading uppercase tracking-[0.2em] text-xs px-6 py-3 rounded-lg transition-all duration-200 hover:glow-gold-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Joining...' : 'Subscribe'}
              </button>
            </fetcher.Form>
          )}

          {fetcher.data?.error && (
            <p className="text-danger-500 text-xs mt-3">{fetcher.data.error}</p>
          )}

          <p className="text-chrome-600 text-xs mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* --- Skeleton --- */
function ProductCardSkeleton() {
  return (
    <div className="surface-vault rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-vault-700" />
      <div className="p-4 space-y-3">
        <div className="h-2 w-16 bg-vault-700 rounded" />
        <div className="h-3 w-3/4 bg-vault-700 rounded" />
        <div className="h-3 w-1/3 bg-vault-700 rounded" />
      </div>
    </div>
  );
}

/* --- GraphQL --- */
const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    vendor
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    beybladeType: metafield(namespace: "beyblade", key: "type") { value }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
