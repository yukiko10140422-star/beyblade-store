import clsx from 'clsx';

/**
 * AvailabilityBadge — shows rarity/availability status instead of battle type.
 * Derives badge from product tags: pre-order, limited-edition, collaboration, tournament, etc.
 * Exported as TypeBadge for backward compatibility.
 */

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
  priority: number;
}

const BADGE_MAP: Record<string, BadgeConfig> = {
  'pre-order': {
    label: 'Pre-Order',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    priority: 1,
  },
  collaboration: {
    label: 'Collaboration',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    priority: 2,
  },
  'japan-exclusive': {
    label: 'Japan Exclusive',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    priority: 3,
  },
  'limited-edition': {
    label: 'Limited',
    bg: 'bg-gold-400/15',
    text: 'text-gold-400',
    border: 'border-gold-400/30',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
    priority: 4,
  },
  rare: {
    label: 'Rare',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    priority: 5,
  },
};

function getBadge(tags: string | null | undefined): BadgeConfig | null {
  if (!tags) return null;
  const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
  let best: BadgeConfig | null = null;
  for (const tag of tagList) {
    const config = BADGE_MAP[tag];
    if (config && (!best || config.priority < best.priority)) {
      best = config;
    }
  }
  return best;
}

interface TypeBadgeProps {
  type?: string | null;
  tags?: string | null;
  size?: 'sm' | 'md';
}

export function TypeBadge({tags, size = 'sm'}: TypeBadgeProps) {
  const badge = getBadge(tags);
  if (!badge) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border rounded-full font-heading uppercase tracking-wider',
        badge.bg,
        badge.text,
        badge.border,
        size === 'sm' && 'text-[9px] px-2 py-0.5',
        size === 'md' && 'text-[10px] px-2.5 py-1',
      )}
    >
      <svg
        className={clsx(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
      </svg>
      {badge.label}
    </span>
  );
}
