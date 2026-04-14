import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';
export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};
export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const children = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(children)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
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
          <FreeShippingBar
            subtotal={parseFloat(cart?.cost?.subtotalAmount?.amount ?? '0')}
          />
          <CartSummary cart={cart} layout={layout} />
        </>
      )}
    </section>
  );
}

const EXPRESS_UPGRADE_THRESHOLD = 300;

function FreeShippingBar({subtotal}: {subtotal: number}) {
  const remaining = EXPRESS_UPGRADE_THRESHOLD - subtotal;
  const progress = Math.min((subtotal / EXPRESS_UPGRADE_THRESHOLD) * 100, 100);
  const qualified = remaining <= 0;

  return (
    <div className="px-1 py-3 border-t border-vault-700">
      <p className="text-chrome-500 text-[10px] text-center mb-2">
        Free shipping & duties included on all orders
      </p>
      {qualified ? (
        <p className="text-gold-400 text-xs font-heading uppercase tracking-wider text-center flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Free DHL/FedEx Express upgrade unlocked!
        </p>
      ) : (
        <>
          <p className="text-chrome-400 text-xs text-center mb-2">
            Add{' '}
            <span className="text-gold-400 font-heading">
              ${remaining.toFixed(2)}
            </span>{' '}
            more for{' '}
            <span className="text-chrome-200">
              free DHL/FedEx Express upgrade
            </span>
          </p>
          <div className="w-full h-1.5 bg-vault-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-500"
              style={{width: `${progress}%`}}
            />
          </div>
        </>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div
      hidden={hidden}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <svg
        className="w-16 h-16 text-vault-600 mb-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        viewBox="0 0 24 24"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p className="text-chrome-400 text-sm mb-6">Your vault is empty</p>
      <Link
        to="/collections"
        onClick={close}
        prefetch="viewport"
        className="text-gold-500 hover:text-gold-400 font-heading text-xs uppercase tracking-wider transition-colors"
      >
        Start collecting &rarr;
      </Link>
    </div>
  );
}
