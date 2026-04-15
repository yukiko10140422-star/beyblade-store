import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ArrowRightIcon,
} from '~/components/icons';
import {Reveal} from '~/components/motion';

export function FeaturedHero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-vault-950 via-bey-attack/5 to-vault-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bey-attack/8 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Product Image */}
          <Reveal direction="left">
            <Link
              to="/products/beyblade-x-ux-00-aero-pegasus-3-70a-red-version-japan-exclusive"
              className="group block relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Glow ring behind product */}
                <div className="absolute inset-8 rounded-full border border-bey-attack/20 animate-[pulse-gold_3s_ease-in-out_infinite]" />
                <div className="absolute inset-16 rounded-full border border-bey-attack/10" />
                <Image
                  data={{
                    url: 'https://cdn.shopify.com/s/files/1/0675/6945/1074/files/tsv-8215548133442-main.png',
                    altText: 'Beyblade X UX-00 Aero Pegasus 3-70A RED Version',
                    width: 800,
                    height: 800,
                  }}
                  aspectRatio="1/1"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="eager"
                  className="relative w-full h-full object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </Link>
          </Reveal>

          {/* Right: Product Info */}
          <Reveal direction="right">
            <div className="space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="text-[10px] font-heading uppercase tracking-widest bg-bey-attack/15 text-bey-attack border border-bey-attack/30 px-3 py-1 rounded-full">
                  Japan Exclusive
                </span>
                <span className="text-[10px] font-heading uppercase tracking-widest bg-danger-500/20 text-danger-500 border border-danger-500/30 px-3 py-1 rounded-full">
                  Limited Stock
                </span>
              </div>

              {/* Title */}
              <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl text-chrome-100 uppercase tracking-wide leading-tight">
                Aero Pegasus
                <br />
                <span className="text-bey-attack">3-70A RED</span>
              </h2>

              {/* Subtitle */}
              <p className="text-chrome-400 text-sm md:text-base max-w-lg mx-auto lg:mx-0">
                The UX-00 Japan-exclusive RED version. An ultra-rare colorway
                not available outside Japan — sourced directly from Tokyo for
                serious collectors.
              </p>

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0">
                <div className="surface-vault rounded-lg p-3 text-center">
                  <p className="text-bey-attack font-heading text-xs uppercase tracking-wider">
                    Series
                  </p>
                  <p className="text-chrome-200 font-heading text-sm mt-1">
                    UX-00
                  </p>
                </div>
                <div className="surface-vault rounded-lg p-3 text-center">
                  <p className="text-bey-attack font-heading text-xs uppercase tracking-wider">
                    Ratchet
                  </p>
                  <p className="text-chrome-200 font-heading text-sm mt-1">
                    3-70
                  </p>
                </div>
                <div className="surface-vault rounded-lg p-3 text-center">
                  <p className="text-bey-attack font-heading text-xs uppercase tracking-wider">
                    Bit
                  </p>
                  <p className="text-chrome-200 font-heading text-sm mt-1">
                    A (Accel)
                  </p>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div>
                  <span className="text-gold-400 font-heading text-3xl">
                    $70.00
                  </span>
                  <span className="text-chrome-500 text-xs ml-2">
                    Shipping & duties included
                  </span>
                </div>
                <Link
                  to="/products/beyblade-x-ux-00-aero-pegasus-3-70a-red-version-japan-exclusive"
                  className="group inline-flex items-center gap-2 bg-bey-attack hover:bg-bey-attack/90 text-white font-heading uppercase tracking-[0.15em] text-sm px-8 py-4 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                >
                  View Details
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-4 justify-center lg:justify-start text-chrome-500 text-xs">
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-gold-400" />
                  DDP — Tax included
                </span>
                <span className="flex items-center gap-1">
                  <PaperAirplaneIcon className="w-3.5 h-3.5 text-gold-400" />
                  Ships from Tokyo
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-gold-400" />
                  100% Authentic
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
