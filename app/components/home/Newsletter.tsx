import {NewsletterForm} from '~/components/NewsletterForm';
import {Reveal} from '~/components/motion';

export function Newsletter() {
  return (
    <section className="py-16 md:py-24 px-4 bg-vault-800">
      <Reveal>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-vermillion-500 font-heading text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
            Get 15% Off Your First Order
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-vault-50 mb-4 tracking-tight">
            Vault Access
          </h2>
          <p className="text-chrome-400 text-base mb-8 leading-relaxed">
            Get early access to drops, exclusive releases, and collector
            insights — direct from Tokyo.
          </p>

          <NewsletterForm variant="large" />

          <p className="text-chrome-500 text-xs mt-4">
            Use code{' '}
            <span className="font-mono font-semibold text-vault-50">
              VAULT15
            </span>{' '}
            at checkout · No spam · Unsubscribe anytime
          </p>
        </div>
      </Reveal>
    </section>
  );
}
