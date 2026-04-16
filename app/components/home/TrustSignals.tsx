import {
  ShieldCheckIcon,
  PaperAirplaneIcon,
  GlobeIcon,
  StarIcon,
} from '~/components/icons';
import {StaggerContainer, StaggerItem} from '~/components/motion';

export function TrustSignals() {
  const signals = [
    {
      title: '3,800+ Reviews',
      description: '99.6% on eBay (NinJapon)',
      icon: <GlobeIcon className="w-7 h-7" />,
      href: 'https://www.ebay.com/usr/ninjapon',
    },
    {
      title: '100% Authentic',
      description: 'Genuine Takara Tomy only',
      icon: <ShieldCheckIcon className="w-7 h-7" />,
    },
    {
      title: 'Collector Grade',
      description: 'Carefully inspected & packed',
      icon: <StarIcon className="w-7 h-7" />,
    },
    {
      title: 'Free Worldwide',
      description: 'DDP — duties included',
      icon: <PaperAirplaneIcon className="w-7 h-7" />,
    },
  ];

  return (
    <section className="py-10 border-y border-vault-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((s) => {
            const inner = (
              <>
                <div className="text-gold-400">{s.icon}</div>
                <h3 className="font-heading text-[11px] uppercase tracking-[0.15em] text-chrome-200">
                  {s.title}
                </h3>
                <p className="text-chrome-500 text-xs">{s.description}</p>
              </>
            );
            return (
              <StaggerItem
                key={s.title}
                className="flex flex-col items-center text-center gap-3"
              >
                {'href' in s && s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 hover:text-gold-400 transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
