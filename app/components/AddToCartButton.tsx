import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {SpinnerIcon} from '~/components/icons';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="w-full py-4 rounded-lg font-heading uppercase tracking-[0.2em] text-sm bg-gold-500 hover:bg-gold-400 text-vault-950 transition-all duration-300 hover:glow-gold-lg disabled:bg-vault-700 disabled:text-chrome-600 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {fetcher.state !== 'idle' ? (
              <span className="inline-flex items-center justify-center gap-2">
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                Adding...
              </span>
            ) : (
              children
            )}
          </button>
        </>
      )}
    </CartForm>
  );
}
