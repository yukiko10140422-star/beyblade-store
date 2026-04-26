import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import clsx from 'clsx';

export function ProductForm({
  productOptions,
  selectedVariant,
  isPreOrder = false,
  expectedShipDate,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  isPreOrder?: boolean;
  expectedShipDate?: string;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div key={option.name}>
            <h5 className="font-heading text-xs uppercase tracking-[0.15em] text-vault-50 mb-3 font-semibold">
              {option.name}
            </h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const optionClasses = clsx(
                  'px-4 py-2 rounded-lg border text-sm font-heading uppercase tracking-wider transition-all duration-200',
                  selected
                    ? 'border-vermillion-500 bg-vermillion-50 text-vermillion-600 font-semibold'
                    : 'border-vault-700 bg-white text-vault-50 hover:border-vermillion-300 hover:bg-vault-800',
                  !available && 'opacity-30 cursor-not-allowed',
                  !exists && 'hidden',
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={optionClasses}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={optionClasses}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      {/* Quantity selector */}
      <div>
        <label
          htmlFor="product-quantity"
          className="block font-heading text-xs uppercase tracking-[0.15em] text-vault-50 mb-3 font-semibold"
        >
          Quantity
        </label>
        <div className="inline-flex items-center bg-white border border-vault-700 rounded-full overflow-hidden">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="px-4 py-2 text-vault-50 hover:text-vermillion-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            −
          </button>
          <input
            id="product-quantity"
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n) && n >= 1 && n <= 99) setQuantity(n);
            }}
            className="w-12 py-2 text-center bg-transparent border-x border-vault-700 text-vault-50 font-heading text-sm font-semibold focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            disabled={quantity >= 99}
            className="px-4 py-2 text-vault-50 hover:text-vermillion-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            +
          </button>
        </div>
      </div>

      {isPreOrder && (
        <div className="rounded-xl overflow-hidden border border-vermillion-200 bg-vermillion-50">
          <div className="px-4 py-2 bg-vermillion-100 border-b border-vermillion-200 flex items-center gap-2">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-vermillion-600"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-vermillion-600 font-semibold">
              Pre-Order
            </span>
          </div>
          <div className="px-4 py-3 space-y-1">
            {expectedShipDate &&
              (() => {
                const d = new Date(expectedShipDate + 'T00:00:00');
                const month = d
                  .toLocaleDateString('en-US', {month: 'short'})
                  .toUpperCase();
                const day = d.getDate();
                const year = d.getFullYear();
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-white border border-vermillion-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-vermillion-500 text-[10px] font-heading uppercase leading-none font-semibold">
                        {month}
                      </span>
                      <span className="text-vault-50 text-xl font-display font-bold leading-tight">
                        {day}
                      </span>
                      <span className="text-chrome-500 text-[9px] leading-none">
                        {year}
                      </span>
                    </div>
                    <div>
                      <p className="text-vault-50 text-sm font-semibold">
                        Japan Release Date
                      </p>
                      <p className="text-chrome-400 text-xs mt-0.5">
                        Ships within 3-5 days after release
                      </p>
                    </div>
                  </div>
                );
              })()}
            {!expectedShipDate && (
              <p className="text-vault-50 text-sm">
                Ships as soon as released in Japan
              </p>
            )}
          </div>
        </div>
      )}

      <AddToCartButton
        disabled={
          !selectedVariant || (!selectedVariant.availableForSale && !isPreOrder)
        }
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {isPreOrder
          ? 'Pre-Order Now'
          : selectedVariant?.availableForSale
            ? 'Add to Vault'
            : 'Sold Out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <div
      aria-label={name}
      className="w-6 h-6 rounded-full border border-vault-600"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && (
        <img src={image} alt={name} className="w-full h-full rounded-full" />
      )}
    </div>
  );
}
