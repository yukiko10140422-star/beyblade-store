import {useEffect, useRef, useState} from 'react';

/**
 * Ship-to country picker (header, product page and footer).
 * Choosing a country stores it in the `customerCountry` cookie for a year and
 * reloads, so prices, "Free tracked shipping to …" and delivery dates follow it.
 *
 * Server-side detection order (app/lib/context.ts):
 *   1. customerCountry cookie ← written here
 *   2. oxygen-buyer-country header (Shopify Oxygen edge geo)
 *   3. 'US' fallback
 *
 * Flags are images (flagcdn.com, allowed in entry.server.tsx imgSrc) because
 * Windows does not draw flag emoji — it shows the two letters instead
 * (owner request 2026-11-26: make the picker easy to find, with flags).
 */

// The 18 destinations the shop ships to (owner decisions 2026-11-25 / 11-26,
// SHIP_TO_COUNTRIES in ~/lib/shipping). Others are not listed.
const COUNTRIES: ReadonlyArray<{code: string; name: string}> = [
  {code: 'US', name: 'United States'},
  {code: 'CA', name: 'Canada'},
  {code: 'GB', name: 'United Kingdom'},
  {code: 'AU', name: 'Australia'},
  {code: 'NZ', name: 'New Zealand'},
  {code: 'SG', name: 'Singapore'},
  {code: 'TW', name: 'Taiwan'},
  {code: 'HK', name: 'Hong Kong'},
  {code: 'KR', name: 'South Korea'},
  {code: 'TH', name: 'Thailand'},
  {code: 'MY', name: 'Malaysia'},
  {code: 'AE', name: 'United Arab Emirates'},
  {code: 'CH', name: 'Switzerland'},
  {code: 'IS', name: 'Iceland'},
  {code: 'LI', name: 'Liechtenstein'},
  {code: 'AD', name: 'Andorra'},
  {code: 'MC', name: 'Monaco'},
  {code: 'SM', name: 'San Marino'},
];

export const FLAG_IMG_ORIGIN = 'https://flagcdn.com';

export function Flag({code, className = ''}: {code: string; className?: string}) {
  const cc = code.toLowerCase();
  return (
    <img
      src={`${FLAG_IMG_ORIGIN}/w40/${cc}.png`}
      srcSet={`${FLAG_IMG_ORIGIN}/w80/${cc}.png 2x`}
      width={20}
      height={15}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 ${className}`}
    />
  );
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function writeCookie(name: string, value: string): void {
  const oneYear = 365 * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
}

type Variant = 'header' | 'inline' | 'footer';

interface CountryPickerProps {
  className?: string;
  /** Country the server used for this page (cookie or Oxygen geo). */
  initialCountry?: string | null;
  /**
   * 'header': flag + "Ship to CA" button, list opens downward.
   * 'inline': "Ship to: <flag> Canada (change)" on the product page.
   * 'footer': compact, list opens upward.
   */
  variant?: Variant;
}

const TRIGGER_CLASS: Record<Variant, string> = {
  inline:
    'rounded-[2px] text-left text-sm text-chrome-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-holo-500',
  header:
    'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[4px] border border-vault-700 bg-white px-2.5 text-sm text-chrome-200 transition-colors hover:border-holo-500 hover:text-holo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-holo-500',
  footer:
    'inline-flex h-10 items-center gap-1.5 rounded-[4px] px-2 text-sm text-chrome-300 transition-colors hover:bg-vault-800 hover:text-holo-500 focus:outline-none focus:ring-2 focus:ring-holo-500',
};

const LIST_POSITION: Record<Variant, string> = {
  footer: 'bottom-full left-0 mb-2 md:left-auto md:right-0',
  header: 'right-0 top-full mt-2',
  inline: 'left-0 top-full mt-2',
};

export function CountryPicker({
  className = '',
  initialCountry = null,
  variant = 'footer',
}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(
    initialCountry ? initialCountry.toUpperCase() : null,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookieValue = readCookie('customerCountry');
    if (cookieValue) setCurrent(cookieValue.toUpperCase());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleSelect = (code: string) => {
    // Always store the choice (also when it matches what is shown), so the
    // server uses it for prices and delivery dates.
    if (readCookie('customerCountry')?.toUpperCase() === code) {
      setOpen(false);
      return;
    }
    writeCookie('customerCountry', code);
    setOpen(false);
    window.location.reload();
  };

  const currentMeta = COUNTRIES.find((c) => c.code === current) ?? null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={
          currentMeta
            ? `Ship to: ${currentMeta.name}. Change country`
            : 'Choose your shipping country'
        }
        onClick={() => setOpen((v) => !v)}
        className={TRIGGER_CLASS[variant]}
      >
        {variant === 'inline' ? (
          <InlineLabel meta={currentMeta} />
        ) : (
          <ButtonLabel meta={currentMeta} variant={variant} open={open} />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select shipping country"
          className={`absolute ${LIST_POSITION[variant]} z-50 max-h-80 w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[4px] border border-vault-700 bg-white py-1 shadow-lg`}
        >
          <li role="presentation" className="px-3 pb-1 pt-1.5 text-xs text-chrome-500">
            We ship to these countries
          </li>
          {COUNTRIES.map((c) => {
            const selected = c.code === current;
            return (
              <li key={c.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-vault-800 hover:text-holo-500 ${
                    selected ? 'font-semibold text-holo-500' : 'text-chrome-300'
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="flex-1">{c.name}</span>
                  {selected && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type Meta = {code: string; name: string} | null;

function InlineLabel({meta}: {meta: Meta}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span>Ship to:</span>
      {meta ? (
        <>
          <Flag code={meta.code} />
          <b className="font-semibold text-chrome-200">{meta.name}</b>
        </>
      ) : (
        <b className="font-semibold text-chrome-200">choose your country</b>
      )}
      <span className="text-holo-500 underline-offset-2 hover:underline">
        (change)
      </span>
    </span>
  );
}

function ButtonLabel({
  meta,
  variant,
  open,
}: {
  meta: Meta;
  variant: Variant;
  open: boolean;
}) {
  return (
    <>
      {meta ? <Flag code={meta.code} /> : <GlobeIcon />}
      <span className="whitespace-nowrap font-medium">
        {variant === 'header' && meta && (
          <span className="hidden 2xl:inline">Ship to </span>
        )}
        {meta ? meta.code : 'Ship to'}
      </span>
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      >
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path
        d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
      />
    </svg>
  );
}

export default CountryPicker;
