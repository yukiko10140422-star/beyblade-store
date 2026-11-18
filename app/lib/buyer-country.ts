/**
 * The buyer's country when it is actually known: the `customerCountry`
 * cookie (country picker) or Oxygen's geo header. null when neither is
 * there — the storefront then falls back to US for prices, but nothing
 * country-specific (like "Free tracked shipping to …") may be claimed.
 */
export function detectedCountry(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const m = /(?:^|;\s*)customerCountry=([A-Za-z]{2})(?:;|$)/.exec(cookie);
  if (m) return m[1].toUpperCase();
  const h = request.headers.get('oxygen-buyer-country');
  return h && /^[A-Za-z]{2}$/.test(h) ? h.toUpperCase() : null;
}
