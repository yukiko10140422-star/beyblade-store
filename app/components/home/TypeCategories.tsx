import {Link} from 'react-router';
import {ShieldCheckIcon, ClockIcon} from '~/components/icons';
import {Reveal, StaggerContainer, StaggerItem} from '~/components/motion';

export function TypeCategories() {
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
      icon: <ShieldCheckIcon className="w-12 h-12" />,
    },
    {
      name: 'Stamina',
      description: 'Endurance & Spin',
      color: 'from-orange-500/20',
      text: 'text-bey-stamina',
      border: 'bg-bey-stamina',
      icon: <ClockIcon className="w-12 h-12" />,
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
                to={`/collections/all-beyblades?type=${type.name}`}
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
