import {useEffect, useRef, useState} from 'react';

/**
 * 顧客が国を手動で切替えるためのドロップダウン。
 * 選択時に `customerCountry` cookie を 1 年間セットし、ページをリロードする。
 * Header の好きな場所に <CountryPicker /> として配置するだけで動作する。
 *
 * 既定の検出順 (app/lib/context.ts):
 *   1. customerCountry cookie ← このコンポーネントが書き込む
 *   2. oxygen-buyer-country header (Shopify Oxygen edge geo)
 *   3. 'US' フォールバック
 */

// The 21 destinations the shop ships to (owner decision 2026-11-25,
// SHIP_TO_COUNTRIES in ~/lib/shipping). Others are not listed.
const COUNTRIES: ReadonlyArray<{code: string; name: string; flag: string}> = [
  {code: 'US', name: 'United States', flag: '🇺🇸'},
  {code: 'CA', name: 'Canada', flag: '🇨🇦'},
  {code: 'GB', name: 'United Kingdom', flag: '🇬🇧'},
  {code: 'AU', name: 'Australia', flag: '🇦🇺'},
  {code: 'NZ', name: 'New Zealand', flag: '🇳🇿'},
  {code: 'SG', name: 'Singapore', flag: '🇸🇬'},
  {code: 'TW', name: 'Taiwan', flag: '🇹🇼'},
  {code: 'HK', name: 'Hong Kong', flag: '🇭🇰'},
  {code: 'MO', name: 'Macau', flag: '🇲🇴'},
  {code: 'KR', name: 'South Korea', flag: '🇰🇷'},
  {code: 'TH', name: 'Thailand', flag: '🇹🇭'},
  {code: 'MY', name: 'Malaysia', flag: '🇲🇾'},
  {code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪'},
  {code: 'CH', name: 'Switzerland', flag: '🇨🇭'},
  {code: 'NO', name: 'Norway', flag: '🇳🇴'},
  {code: 'IS', name: 'Iceland', flag: '🇮🇸'},
  {code: 'LI', name: 'Liechtenstein', flag: '🇱🇮'},
  {code: 'AD', name: 'Andorra', flag: '🇦🇩'},
  {code: 'MC', name: 'Monaco', flag: '🇲🇨'},
  {code: 'SM', name: 'San Marino', flag: '🇸🇲'},
  {code: 'MD', name: 'Moldova', flag: '🇲🇩'},
];

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function writeCookie(name: string, value: string): void {
  const oneYear = 365 * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
}

interface CountryPickerProps {
  className?: string;
}

export function CountryPicker({className = ''}: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  // null until the buyer picks a country (no cookie yet).
  const [current, setCurrent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookieValue = readCookie('customerCountry');
    if (cookieValue) {
      setCurrent(cookieValue.toUpperCase());
    }
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
          currentMeta ? `Ship to: ${currentMeta.name}` : 'Choose your country'
        }
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-10 rounded-[4px] px-2 text-sm text-chrome-300 hover:text-holo-500 hover:bg-vault-800 focus:outline-none focus:ring-2 focus:ring-holo-500 transition-colors"
      >
        {currentMeta ? (
          <>
            <span aria-hidden="true">{currentMeta.flag}</span>
            <span className="font-medium">{currentMeta.code}</span>
          </>
        ) : (
          <span className="font-medium">Ship to</span>
        )}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select shipping country"
          className="absolute right-0 bottom-full z-50 mb-2 max-h-80 w-56 overflow-y-auto rounded-[4px] border border-vault-700 bg-white py-1"
        >
          {COUNTRIES.map((c) => {
            const selected = c.code === current;
            return (
              <li key={c.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-vault-800 hover:text-holo-500 transition-colors ${
                    selected ? 'text-silver-400' : 'text-chrome-300'
                  }`}
                >
                  <span aria-hidden="true">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-chrome-500">
                    {c.code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CountryPicker;
