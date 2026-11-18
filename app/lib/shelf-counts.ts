import type {Storefront} from '@shopify/hydrogen';
import {SHELVES, isOwnProduct} from '~/lib/site';

/**
 * Number of Spin products on each shelf, so entry points (header, home,
 * empty cart) only show shelves that have something. The collections are
 * shared by the three Vault sites, so products are counted with
 * isOwnProduct. Up to 250 per shelf (more than the catalog today); a shelf
 * at 250 is shown in any case.
 */
const SHELF_COUNTS_QUERY = `#graphql
  fragment ShelfCountProducts on Collection {
    products(first: 250) {
      nodes {
        tags
      }
    }
  }
  query ShelfCounts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    beybladeX: collection(handle: "beyblade-x") {
      ...ShelfCountProducts
    }
    preOrder: collection(handle: "pre-order") {
      ...ShelfCountProducts
    }
    starters: collection(handle: "starters") {
      ...ShelfCountProducts
    }
    boosters: collection(handle: "boosters") {
      ...ShelfCountProducts
    }
    randomBoosters: collection(handle: "random-boosters") {
      ...ShelfCountProducts
    }
    singleBeys: collection(handle: "single-beys") {
      ...ShelfCountProducts
    }
    sets: collection(handle: "beyblade-sets-bundles") {
      ...ShelfCountProducts
    }
    launchers: collection(handle: "launchers-accessories") {
      ...ShelfCountProducts
    }
    stadiums: collection(handle: "stadiums") {
      ...ShelfCountProducts
    }
    parts: collection(handle: "parts-accessories") {
      ...ShelfCountProducts
    }
    limited: collection(handle: "rare-exclusive") {
      ...ShelfCountProducts
    }
    all: collection(handle: "all-beyblades") {
      ...ShelfCountProducts
    }
  }
` as const;

const ALIAS_TO_HANDLE: Record<string, string> = {
  beybladeX: 'beyblade-x',
  preOrder: 'pre-order',
  starters: 'starters',
  boosters: 'boosters',
  randomBoosters: 'random-boosters',
  singleBeys: 'single-beys',
  sets: 'beyblade-sets-bundles',
  launchers: 'launchers-accessories',
  stadiums: 'stadiums',
  parts: 'parts-accessories',
  limited: 'rare-exclusive',
  all: 'all-beyblades',
};

export type ShelfCounts = Record<string, number>;

/** handle → Spin product count; null when the counts could not be read. */
export async function loadShelfCounts(
  storefront: Storefront,
): Promise<ShelfCounts | null> {
  try {
    const res = (await storefront.query(SHELF_COUNTS_QUERY, {
      cache: storefront.CacheLong(),
    })) as Record<string, {products: {nodes: Array<{tags: string[]}>}} | null>;
    const out: ShelfCounts = {};
    for (const [alias, handle] of Object.entries(ALIAS_TO_HANDLE)) {
      const nodes = res[alias]?.products.nodes ?? [];
      out[handle] = nodes.filter(isOwnProduct).length;
    }
    return out;
  } catch (error) {
    console.error('Shelf counts query failed:', error);
    return null;
  }
}

/** Shelves to offer as entry points (all of them when counts are unknown). */
export function visibleShelves(counts: ShelfCounts | null | undefined) {
  if (!counts) return SHELVES;
  return SHELVES.filter((s) => (counts[s.handle] ?? 0) > 0);
}
