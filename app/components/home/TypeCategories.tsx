import {Reveal, StaggerContainer, StaggerItem} from '~/components/motion';

export function TypeCategories() {
  const points = [
    {
      title: 'Pre-Order New Releases',
      desc: 'Reserve upcoming Beyblades before they launch in Japan. Shipped within days of release.',
      color: 'text-blue-400',
      gradient: 'from-blue-500/20',
      border: 'bg-blue-500',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Japan-Only Exclusives',
      desc: 'Event prizes, app exclusives, and store-limited editions unavailable outside Japan.',
      color: 'text-red-400',
      gradient: 'from-red-500/20',
      border: 'bg-red-500',
      icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    },
    {
      title: 'Official Collaborations',
      desc: 'J.League, JFA, and special crossover models sourced directly from partner retailers.',
      color: 'text-purple-400',
      gradient: 'from-purple-500/20',
      border: 'bg-purple-500',
      icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    },
    {
      title: 'Free DDP Shipping',
      desc: 'All duties and taxes included. No surprise fees at delivery. Ships from Tokyo worldwide.',
      color: 'text-gold-400',
      gradient: 'from-gold-400/20',
      border: 'bg-gold-400',
      icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h4.875c.621 0 1.125-.504 1.125-1.125v-3a1.125 1.125 0 00-1.125-1.125H3.375m0 5.25V7.5a1.125 1.125 0 011.125-1.125h8.25M16.5 12h2.25m-2.25 0a1.125 1.125 0 00-1.125 1.125v3c0 .621.504 1.125 1.125 1.125h2.25',
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-vault-950">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="font-heading text-xl md:text-2xl text-gold-metallic uppercase tracking-wider text-center mb-3">
            Why Tokyo Spin Vault
          </h2>
          <p className="text-chrome-500 text-sm text-center mb-12 max-w-lg mx-auto">
            Your direct line to Japan's rarest Beyblades
          </p>
        </Reveal>
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {points.map((p) => (
            <StaggerItem key={p.title}>
              <div className="relative h-full rounded-xl overflow-hidden surface-vault p-5 md:p-6">
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${p.gradient} to-transparent opacity-20`}
                />
                <div className="relative">
                  <svg
                    className={`w-8 h-8 mb-4 ${p.color}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={p.icon}
                    />
                  </svg>
                  <h3
                    className={`font-heading text-sm uppercase tracking-wider mb-2 ${p.color}`}
                  >
                    {p.title}
                  </h3>
                  <p className="text-chrome-500 text-xs leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${p.border} opacity-30`}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
