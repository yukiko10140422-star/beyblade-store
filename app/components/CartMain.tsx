import {useRouteLoaderData} from 'react-router';
import {type ShelfCounts, visibleShelves} from '~/lib/shelf-counts';
import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {ExpressUpgradeBar} from './ExpressUpgradeBar';

import {LockIcon} from '~/components/icons';

export type CartLayout = 'page' | 'aside';
export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};
export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const map: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const nested = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(nested)) {
        if (!map[parentId]) map[parentId] = [];
        map[parentId].push(...childIds);
      }
    }
  }
  return map;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
      className="flex flex-col h-full"
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-vault-700">
          {(cart?.lines?.nodes ?? []).map((line) => {
            if ('parentRelationship' in line && line.parentRelationship?.parent)
              return null;
            return (
              <CartLineItem
                key={line.id}
                line={line}
                layout={layout}
                childrenMap={childrenMap}
              />
            );
          })}
        </ul>
      </div>
      {cartHasItems && (
        <>
          <ExpressUpgradeBar
            subtotal={parseFloat(cart?.cost?.subtotalAmount?.amount ?? '0')}
            currencyCode={cart?.cost?.subtotalAmount?.currencyCode}
            quantity={cart?.totalQuantity ?? 0}
          />
          <CartSummary cart={cart} layout={layout} />
        </>
      )}
    </section>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  const root = useRouteLoaderData('root') as
    | {shelfCounts?: ShelfCounts | null}
    | undefined;
  return (
    <div
      hidden={hidden}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <LockIcon className="w-16 h-16 text-vault-600 mb-6" strokeWidth={1} />
      <p className="text-vault-50 text-base font-display font-semibold mb-2">
        Your vault is empty
      </p>
      <p className="text-chrome-400 text-sm mb-6">
        Japanese Takara Tomy Beyblade X, shipped from Japan
      </p>
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="inline-flex items-center justify-center gap-2 bg-holo-500 hover:bg-holo-600 text-white font-heading font-semibold text-xs px-6 py-3 rounded-[4px] transition-all"
      >
        Browse the vault &rarr;
      </Link>
      <ul
        className="mt-6 flex flex-wrap justify-center gap-2"
        aria-label="Shelves"
      >
        {visibleShelves(root?.shelfCounts).map((s) => (
          <li key={s.handle}>
            <Link
              to={`/collections/${s.handle}`}
              onClick={close}
              prefetch="intent"
              className="inline-block rounded-[4px] border border-vault-700 px-3 py-1 text-xs text-chrome-300 hover:border-holo-400 hover:text-vault-50"
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
