/**
 * Reusable icon components for Tokyo Spin Vault.
 * All icons share a consistent 24x24 viewBox and stroke style by default.
 * Pass custom className for sizing and color (via text-* utility).
 */

interface IconProps {
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

function BaseIcon({
  className,
  strokeWidth = 1.5,
  children,
  'aria-hidden': ariaHidden = true,
}: IconProps & {children: React.ReactNode}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      aria-hidden={ariaHidden}
    >
      {children}
    </svg>
  );
}

/** Shield with checkmark — "100% Authentic" / "Insured" */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </BaseIcon>
  );
}

/** Circular checkmark — success states, "Free shipping unlocked" */
export function CheckCircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </BaseIcon>
  );
}

/** Paper airplane — shipping / send */
export function PaperAirplaneIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </BaseIcon>
  );
}

/** Lock — duties included / secure */
export function LockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </BaseIcon>
  );
}

/** Clock — delivery time */
export function ClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </BaseIcon>
  );
}

/** Globe — worldwide / international */
export function GlobeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
    </BaseIcon>
  );
}

/** Arrow right — CTA, navigation */
export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth={props.strokeWidth ?? 2}>
      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </BaseIcon>
  );
}

/** X mark — close */
export function XMarkIcon(props: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      className={props.className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
