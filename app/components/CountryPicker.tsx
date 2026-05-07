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

const COUNTRIES: ReadonlyArray<{code: string; name: string; flag: string}> = [
  {code: 'US', name: 'United States', flag: '🇺🇸'},
  {code: 'CA', name: 'Canada',        flag: '🇨🇦'},
  {code: 'GB', name: 'United Kingdom', flag: '🇬🇧'},
  {code: 'DE', name: 'Germany',       flag: '🇩🇪'},
  {code: 'FR', name: 'France',        flag: '🇫🇷'},
  {code: 'IT', name: 'Italy',         flag: '🇮🇹'},
  {code: 'ES', name: 'Spain',         flag: '🇪🇸'},
  {code: 'AU', name: 'Australia',     flag: '🇦🇺'},
  {code: 'NZ', name: 'New Zealand',   flag: '🇳🇿'},
  {code: 'SG', name: 'Singapore',     flag: '🇸🇬'},
  {code: 'TW', name: 'Taiwan',        flag: '🇹🇼'},
  {code: 'HK', name: 'Hong Kong',     flag: '🇭🇰'},
  {code: 'KR', name: 'South Korea',   flag: '🇰🇷'},
  {code: 'PH', name: 'Philippines',   flag: '🇵🇭'},
  {code: 'IE', name: 'Ireland',       flag: '🇮🇪'},
  {code: 'NL', name: 'Netherlands',   flag: '🇳🇱'},
  {code: 'SE', name: 'Sweden',        flag: '🇸🇪'},
  {code: 'CH', name: 'Switzerland',   flag: '🇨🇭'},
  {code: 'NO', name: 'Norway',        flag: '🇳🇴'},
  {code: 'DK', name: 'Denmark',       flag: '🇩🇰'},
  {code: 'FI', name: 'Finland',       flag: '🇫🇮'},
  {code: 'BE', name: 'Belgium',       flag: '🇧🇪'},
  {code: 'AT', name: 'Austria',       flag: '🇦🇹'},
  {code: 'PT', name: 'Portugal',      flag: '🇵🇹'},
  {code: 'PL', name: 'Poland',        flag: '🇵🇱'},
  {code: 'MX', name: 'Mexico',        flag: '🇲🇽'},
  {code: 'BR', name: 'Brazil',        flag: '🇧🇷'},
  {code: 'AE', name: 'UAE',           flag: '🇦🇪'},
  {code: 'IL', name: 'Israel',        flag: '🇮🇱'},
  {code: 'ZA', name: 'South Africa',  flag: '🇿🇦'},
  {code: 'IN', name: 'India',         flag: '🇮🇳'},
  {code: 'TH', name: 'Thailand',      flag: '🇹🇭'},
  {code: 'MY', name: 'Malaysia',      flag: '🇲🇾'},
  {code: 'ID', name: 'Indonesia',     flag: '🇮🇩'},
  {code: 'VN', name: 'Vietnam',       flag: '🇻🇳'},
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
  const [current, setCurrent] = useState<string>('US');
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
    if (code === current) {
      setOpen(false);
      return;
    }
    writeCookie('customerCountry', code);
    setOpen(false);
    window.location.reload();
  };

  const currentMeta =
    COUNTRIES.find((c) => c.code === current) ?? COUNTRIES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Ship to: ${currentMeta.name}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-chrome-700 bg-vault-800 px-3 py-1.5 text-sm text-chrome-200 hover:border-gold-500 hover:text-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
      >
        <span aria-hidden="true">{currentMeta.flag}</span>
        <span className="font-medium">{currentMeta.code}</span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select shipping country"
          className="absolute right-0 top-full z-50 mt-2 max-h-80 w-56 overflow-y-auto rounded-lg border border-chrome-700 bg-vault-900 py-1 shadow-xl"
        >
          {COUNTRIES.map((c) => {
            const selected = c.code === current;
            return (
              <li key={c.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-vault-800 ${
                    selected ? 'text-gold-400' : 'text-chrome-200'
                  }`}
                >
                  <span aria-hidden="true">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-chrome-500">{c.code}</span>
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
