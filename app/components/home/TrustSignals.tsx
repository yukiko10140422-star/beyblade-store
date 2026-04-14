import {
  ShieldCheckIcon,
  PaperAirplaneIcon,
  GlobeIcon,
} from '~/components/icons';
import {StaggerContainer, StaggerItem} from '~/components/motion';

export function TrustSignals() {
  const signals = [
    {
      title: 'Japan Direct',
      description: 'Sourced & shipped from Tokyo',
      icon: <GlobeIcon className="w-7 h-7" />,
    },
    {
      title: '100% Authentic',
      description: 'Genuine Takara Tomy only',
      icon: <ShieldCheckIcon className="w-7 h-7" />,
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
      icon: <PaperAirplaneIcon className="w-7 h-7" />,
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
