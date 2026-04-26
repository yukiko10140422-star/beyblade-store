import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {CheckCircleIcon, LockIcon} from '~/components/icons';

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
          <FreeShippingBar
            subtotal={parseFloat(cart?.cost?.subtotalAmount?.amount ?? '0')}
            quantity={cart?.totalQuantity ?? 0}
          />
          <CartSummary cart={cart} layout={layout} />
        </>
      )}
    </section>
  );
}

const EXPRESS_SUBTOTAL_THRESHOLD = 300;
const EXPRESS_QTY_THRESHOLD = 3;

function FreeShippingBar({
  subtotal,
  quantity,
}: {
  subtotal: number;
  quantity: number;
}) {
  const subtotalRemaining = EXPRESS_SUBTOTAL_THRESHOLD - subtotal;
  const qtyRemaining = EXPRESS_QTY_THRESHOLD - quantity;
  const qualified = subtotalRemaining <= 0 || qtyRemaining <= 0;

  // Pick whichever threshold is closer for the progress bar.
  const subtotalProgress = Math.min(
    (subtotal / EXPRESS_SUBTOTAL_THRESHOLD) * 100,
    100,
  );
  const qtyProgress = Math.min((quantity / EXPRESS_QTY_THRESHOLD) * 100, 100);
  const progress = Math.max(subtotalProgress, qtyProgress);

  return (
    <div className="px-1 py-4 border-t border-vault-700">
      <p className="text-vermillion-500 text-[11px] text-center mb-2 font-heading uppercase tracking-wider font-semibold">
        Free shipping &amp; duties pre-paid (DDP) on all orders
      </p>
      {qualified ? (
        <p className="text-vermillion-600 text-sm font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Free DHL/FedEx Express upgrade unlocked!
        </p>
      ) : (
        <>
          <p className="text-chrome-300 text-xs text-center mb-2">
            Add{' '}
            <span className="text-vermillion-500 font-semibold">
              ${subtotalRemaining.toFixed(2)}
            </span>{' '}
            <span className="text-chrome-500">or</span>{' '}
            <span className="text-vermillion-500 font-semibold">
              {qtyRemaining} item{qtyRemaining === 1 ? '' : 's'}
            </span>{' '}
            for{' '}
            <span className="text-vault-50 font-semibold">
              free Express upgrade
            </span>
          </p>
          <div className="w-full h-1.5 bg-vault-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-vermillion-500 rounded-full transition-all duration-500"
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
      <LockIcon className="w-16 h-16 text-vault-600 mb-6" strokeWidth={1} />
      <p className="text-vault-50 text-base font-display font-semibold mb-2">
        Your vault is empty
      </p>
      <p className="text-chrome-400 text-sm mb-6">
        Start your authentic Beyblade collection
      </p>
      <Link
        to="/collections/all-beyblades"
        onClick={close}
        prefetch="viewport"
        className="inline-flex items-center justify-center gap-2 bg-vermillion-500 hover:bg-vermillion-600 text-white font-heading font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all"
      >
        Start collecting &rarr;
      </Link>
    </div>
  );
}
