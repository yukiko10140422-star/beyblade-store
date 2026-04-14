import {NewsletterForm} from '~/components/NewsletterForm';
import {Reveal} from '~/components/motion';

export function Newsletter() {
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

          <NewsletterForm variant="large" />

          <p className="text-chrome-600 text-xs mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
