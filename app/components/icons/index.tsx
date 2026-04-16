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

/** Star — ratings, collector grade */
export function StarIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </BaseIcon>
  );
}

/** Open lock — vault exclusives, unlocked */
export function LockOpenIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </BaseIcon>
  );
}

/** Hamburger menu — mobile toggle */
export function MenuIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      className={props.className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

/** Magnifying glass — search */
export function SearchIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      className={props.className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17 17" />
    </svg>
  );
}

/** Person silhouette — user/account */
export function UserIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      className={props.className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <circle cx="10" cy="7" r="3" />
      <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

/** Shopping cart — cart badge */
export function CartIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth ?? 1.5}
      className={props.className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path d="M6 6h12l-1.5 7H7.5L6 6z" />
      <path d="M6 6L5 2H2" />
      <circle cx="8" cy="17" r="1.5" fill="currentColor" />
      <circle cx="15" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Instagram logo — social media */
export function InstagramIcon(props: IconProps) {
  return (
    <svg
      className={props.className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

/** TikTok logo — social media */
export function TikTokIcon(props: IconProps) {
  return (
    <svg
      className={props.className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.05l-.38.85z" />
    </svg>
  );
}

/** Image placeholder — missing product image */
export function ImagePlaceholderIcon(props: IconProps) {
  return (
    <svg
      className={props.className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

/** Spinner — loading states */
export function SpinnerIcon(props: IconProps) {
  return (
    <svg
      className={props.className}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden={props['aria-hidden'] ?? true}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/** Magnifying glass — search (24x24 stroke variant) */
export function SearchIcon24(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </BaseIcon>
  );
}
