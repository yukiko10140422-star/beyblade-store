import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {SpinnerIcon} from '~/components/icons';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
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
            className={
              className ??
              'w-full py-4 rounded-full font-heading uppercase tracking-[0.15em] text-sm font-semibold bg-vermillion-500 hover:bg-vermillion-600 text-white transition-all duration-200 hover:shadow-lg hover:shadow-vermillion-500/30 disabled:bg-vault-700 disabled:text-chrome-500 disabled:cursor-not-allowed disabled:shadow-none'
            }
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
