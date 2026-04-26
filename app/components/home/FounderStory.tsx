import {Reveal} from '~/components/motion';

/**
 * Founder/origin story — primary social-proof substitute for a 0-review store.
 * Authenticity beats badge count for collectibles.
 */
export function FounderStory() {
  return (
    <section className="bg-white border-y border-vault-700">
      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <Reveal className="md:col-span-5">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-vault-800 border border-vault-700">
              <img
                src="/images/tokyo-night.webp"
                alt="Tokyo, Japan — where every Beyblade is sourced"
                className="w-full h-full object-cover"
                loading="lazy"
                width={500}
                height={625}
              />
            </div>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal>
              <p className="text-vermillion-500 font-heading text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                Sourced in Japan · Run by Collectors
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-vault-50 leading-tight tracking-tight">
                We&rsquo;re Beyblade collectors based in Tokyo.
              </h2>
              <div className="mt-6 space-y-4 text-chrome-300 text-base md:text-lg leading-relaxed">
                <p>
                  Tokyo Spin Vault is run by the team behind <strong className="text-vault-50 font-semibold">NinJapon</strong> — a Japanese export business with <strong className="text-vault-50 font-semibold">3,800+ verified international shipments</strong>.
                </p>
                <p>
                  Every Beyblade is purchased directly from authorized Takara Tomy retailers in Japan — not from middlemen, not from Hasbro repackaging. We hand-pack and ship from our Tokyo warehouse, with all duties and taxes pre-paid (DDP) so you never get a surprise bill at delivery.
                </p>
                <p>
                  We're collectors first. If we wouldn&rsquo;t buy it, we won&rsquo;t sell it.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <div className="font-display text-2xl font-semibold text-vermillion-500">3,800+</div>
                  <div className="text-chrome-500 text-xs uppercase tracking-wider mt-1">Shipments</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-vermillion-500">100%</div>
                  <div className="text-chrome-500 text-xs uppercase tracking-wider mt-1">Authentic</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-vermillion-500">24h</div>
                  <div className="text-chrome-500 text-xs uppercase tracking-wider mt-1">Dispatch</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
