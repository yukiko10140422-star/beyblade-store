import type {Route} from './+types/collections._index';
import {CategoryTiles} from '~/components/home/HomeSections';
import {SITE} from '~/lib/site';

export const meta: Route.MetaFunction = () => {
  return [{title: `Shop by category | ${SITE.name}`}];
};

/**
 * The shelves (Spin's own collections that have products). Shopify's
 * collection list is shared by the three Vault sites, so it is not used.
 */
export default function Collections() {
  return (
    <div className="pt-6">
      <CategoryTiles title="Shop by category" as="h1" />
    </div>
  );
}
