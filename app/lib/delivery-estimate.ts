import {
  EU_COUNTRIES,
  NO_STANDARD_COUNTRIES,
  SHIPPING_METHODS,
  destinationName,
  expressCarrierLabel,
  expressRegionFor,
  findMethod,
  handlingLabel,
  transitDays,
  type ShippingMethodId,
} from './shipping';

export interface MethodEstimate {
  methodLabel: string;
  /** Japan Post standard days after dispatch, or null when not published. */
  transitDays: number | null;
  /** "around Dec 5" — needs handling days and transit days. */
  around: string | null;
}

export interface DeliveryEstimate {
  destination: string;
  /** ISO code the estimate was made for (upper case), or null. */
  countryCode: string | null;
  /** "Ships within 3 business days" — null when the product has no value. */
  handlingLabel: string | null;
  /** The item's own dispatch time (shipping.handling_days). */
  handlingDays: number | null;
  /** The product's own method (from `shipping.service`); null when unknown. */
  standard: MethodEstimate | null;
  /** EMS transit for the destination (used by paid Express rows). */
  emsTransitDays: number | null;
  /** false for destinations the shop does not ship to (EU). */
  shipsHere: boolean;
  /** Express at checkout for this destination; null when the country is unknown. */
  express: {carrierLabel: string; fromUsd: number; isDhl: boolean} | null;
}

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Adds Japan business days (Mon–Fri) to a Japan wall-clock date. */
function addBusinessDays(jstWall: Date, days: number): Date {
  const d = new Date(jstWall);
  // Orders placed on a Saturday/Sunday are handled from the next weekday.
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) added += 1;
  }
  return d;
}

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** Reads an integer metafield value; anything else is "no value". */
export function parseHandlingDays(
  value: string | null | undefined,
): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return n >= 0 && n <= 60 ? n : null;
}

/**
 * "around <date>" = today in Japan + handling (Japan business days) +
 * Japan Post standard days (calendar days, as Japan Post publishes them).
 * Japanese public holidays are not excluded yet.
 */
export function arrivalAround(
  handlingDays: number | null,
  transit: number | null,
  now: Date = new Date(),
): string | null {
  if (handlingDays == null || transit == null) return null;
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const dispatch = addBusinessDays(jstNow, handlingDays);
  return `around ${fmt(new Date(dispatch.getTime() + transit * DAY_MS))}`;
}

export function getDeliveryEstimate(
  country: string | undefined | null,
  handlingDays: number | null,
  serviceValue: string | null | undefined,
  now: Date = new Date(),
): DeliveryEstimate {
  // Unknown method: show nothing about method, transit or arrival (fail closed).
  // No standard method where Japan Post has suspended service (DHL only).
  const cc = (country ?? '').toUpperCase();
  const methodId: ShippingMethodId | undefined =
    NO_STANDARD_COUNTRIES.has(cc) || EU_COUNTRIES.has(cc)
    ? undefined
    : findMethod(serviceValue)?.id;
  const transit = methodId ? transitDays(country, methodId) : null;
  const region = expressRegionFor(country);
  return {
    destination: destinationName(country),
    countryCode: country ? country.toUpperCase() : null,
    shipsHere: !EU_COUNTRIES.has((country ?? '').toUpperCase()),
    handlingLabel: handlingDays != null ? handlingLabel(handlingDays) : null,
    handlingDays,
    standard: methodId
      ? {
          methodLabel: SHIPPING_METHODS[methodId].label,
          transitDays: transit,
          around: arrivalAround(handlingDays, transit, now),
        }
      : null,
    emsTransitDays: region?.carrier === 'dhl' ? null : transitDays(country, 'ems'),
    express: region
      ? {
          carrierLabel: expressCarrierLabel(region.carrier),
          fromUsd: region.fromUsd,
          isDhl: region.carrier === 'dhl',
        }
      : null,
  };
}
