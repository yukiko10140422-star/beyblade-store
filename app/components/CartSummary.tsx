import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div
      aria-labelledby={summaryId}
      className="border-t border-vault-700 pt-4 mt-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-chrome-400 text-sm">Subtotal</span>
        <span className="text-vault-50 font-display text-2xl font-semibold">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-chrome-400">Shipping</span>
        <span className="text-vault-50 font-semibold">FREE worldwide</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-chrome-400">Duties &amp; taxes</span>
        <span className="text-vault-50 font-semibold">Pre-paid (DDP)</span>
      </div>

      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;
  return (
    <a
      href={checkoutUrl}
      target="_self"
      className="block w-full py-4 text-center rounded-full font-heading font-semibold uppercase tracking-[0.15em] text-sm bg-vermillion-500 hover:bg-vermillion-600 text-white transition-all duration-200 hover:shadow-lg hover:shadow-vermillion-500/30"
    >
      Secure Checkout &rarr;
    </a>
  );
}

const inputClass =
  'flex-1 bg-white border border-vault-700 rounded-lg px-3 py-2 text-xs text-vault-50 placeholder:text-chrome-500 focus:outline-none focus:border-vermillion-300 focus:ring-1 focus:ring-vermillion-300/30 transition-all';
const applyBtnClass =
  'text-[10px] font-heading uppercase tracking-wider font-semibold text-vermillion-500 hover:text-vermillion-600 px-3 py-2 border border-vault-700 hover:border-vermillion-300 rounded-lg transition-all';
const removeBtnClass =
  'text-[10px] text-chrome-500 hover:text-danger-500 transition-colors';

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts">
      <dl hidden={!codes.length}>
        <div>
          <UpdateDiscountForm>
            <div
              className="flex items-center gap-2"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <span className="text-xs text-chrome-300">
                <code className="bg-vermillion-50 border border-vermillion-200 px-2 py-0.5 rounded text-vermillion-600 font-semibold">
                  {codes?.join(', ')}
                </code>
              </span>
              <button type="submit" className={removeBtnClass}>
                Remove
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className={inputClass}
          />
          <button type="submit" className={applyBtnClass}>
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data && giftCardCodeInput.current) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;
      if (focusButton) focusButton.focus();
      else if (giftCardCodeInput.current) giftCardCodeInput.current.focus();
      setRemovedCardIndex(null);
    }
    previousCardIdsRef.current = giftCardCodes?.map((card) => card.id) || [];
  }, [giftCardCodes, removedCardIndex]);

  return (
    <section aria-label="Gift cards">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <div className="space-y-2 mb-3">
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm
              key={giftCard.id}
              giftCardId={giftCard.id}
              lastCharacters={giftCard.lastCharacters}
              onRemoveClick={() => {
                const index = previousCardIdsRef.current.indexOf(giftCard.id);
                if (index !== -1) setRemovedCardIndex(index);
              }}
              buttonRef={(el: HTMLButtonElement | null) => {
                if (el) removeButtonRefs.current.set(giftCard.id, el);
                else removeButtonRefs.current.delete(giftCard.id);
              }}
            >
              <div className="flex items-center gap-2">
                <code className="bg-vault-800 border border-vault-700 px-2 py-0.5 rounded text-xs text-vault-50">
                  ***{giftCard.lastCharacters}
                </code>
                <span className="text-xs text-vermillion-500 font-semibold">
                  <Money data={giftCard.amountUsed} />
                </span>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}
      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex gap-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            className={applyBtnClass}
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{giftCardCodes: [giftCardId]}}
    >
      <div className="flex items-center justify-between">
        {children}
        <button
          type="submit"
          aria-label={`Remove gift card ending in ${lastCharacters}`}
          onClick={onRemoveClick}
          ref={buttonRef}
          className={removeBtnClass}
        >
          Remove
        </button>
      </div>
    </CartForm>
  );
}
