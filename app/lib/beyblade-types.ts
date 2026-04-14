export const BEY_TYPES = ['Attack', 'Defense', 'Stamina', 'Balance'] as const;
export type BeybladeType = (typeof BEY_TYPES)[number];

export function isBeyType(value: string): value is BeybladeType {
  return (BEY_TYPES as readonly string[]).includes(value);
}

export const TYPE_CONFIG: Record<
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
