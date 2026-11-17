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
              'h-[50px] w-full rounded-[4px] bg-holo-500 text-base font-semibold text-white transition-colors duration-150 hover:bg-holo-600 disabled:cursor-not-allowed disabled:bg-vault-700 disabled:text-chrome-600'
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
