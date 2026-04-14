import clsx from 'clsx';

type BeybladeType = 'Attack' | 'Defense' | 'Stamina' | 'Balance';

const TYPE_CONFIG: Record<
  BeybladeType,
  {bg: string; text: string; border: string; icon: string}
> = {
  Attack: {
    bg: 'bg-bey-attack/15',
    text: 'text-bey-attack',
    border: 'border-bey-attack/30',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  Defense: {
    bg: 'bg-bey-defense/15',
    text: 'text-bey-defense',
    border: 'border-bey-defense/30',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  Stamina: {
    bg: 'bg-bey-stamina/15',
    text: 'text-bey-stamina',
    border: 'border-bey-stamina/30',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  Balance: {
    bg: 'bg-bey-balance/15',
    text: 'text-bey-balance',
    border: 'border-bey-balance/30',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  },
};

function isValidType(value: string): value is BeybladeType {
  return value in TYPE_CONFIG;
}

interface TypeBadgeProps {
  type: string | null | undefined;
  size?: 'sm' | 'md';
}

export function TypeBadge({type, size = 'sm'}: TypeBadgeProps) {
  if (!type || !isValidType(type)) return null;

  const config = TYPE_CONFIG[type];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border rounded-full font-heading uppercase tracking-wider',
        config.bg,
        config.text,
        config.border,
        size === 'sm' && 'text-[9px] px-2 py-0.5',
        size === 'md' && 'text-[10px] px-2.5 py-1',
      )}
    >
      <svg
        className={clsx(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
      </svg>
      {type}
    </span>
  );
}
