import {Link, useFetcher, type Fetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';
import {SearchIcon24} from '~/components/icons';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null;

  return (
    <div className="mb-6" key="articles">
      <h5 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 px-1">
        Articles
      </h5>
      <ul className="space-y-1">
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li key={article.id}>
              <Link
                onClick={closeSearch}
                to={articleUrl}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-vault-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
              >
                {article.image?.url && (
                  <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-vault-900">
                    <Image
                      alt={article.image.altText ?? ''}
                      src={article.image.url}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <span className="text-chrome-200 text-sm truncate hover:text-gold-400 transition-colors">
                  {article.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null;

  return (
    <div className="mb-6" key="collections">
      <h5 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 px-1">
        Collections
      </h5>
      <ul className="space-y-1">
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li key={collection.id}>
              <Link
                onClick={closeSearch}
                to={collectionUrl}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-vault-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
              >
                {collection.image?.url && (
                  <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-vault-900">
                    <Image
                      alt={collection.image.altText ?? ''}
                      src={collection.image.url}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <span className="text-chrome-200 text-sm truncate hover:text-gold-400 transition-colors">
                  {collection.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <div className="mb-6" key="pages">
      <h5 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 px-1">
        Pages
      </h5>
      <ul className="space-y-1">
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li key={page.id}>
              <Link
                onClick={closeSearch}
                to={pageUrl}
                className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-vault-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
              >
                <span className="text-chrome-200 text-sm truncate hover:text-gold-400 transition-colors">
                  {page.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null;

  return (
    <div className="mb-6" key="products">
      <h5 className="font-heading text-xs uppercase tracking-[0.2em] text-gold-400 mb-3 px-1">
        Products
      </h5>
      <ul className="space-y-1">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li key={product.id}>
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-vault-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50"
              >
                {image && (
                  <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-vault-900">
                    <Image
                      alt={image.altText ?? ''}
                      src={image.url}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-chrome-200 text-sm truncate">
                    {product.title}
                  </p>
                  <small className="text-gold-400 font-heading text-xs">
                    {price && <Money data={price} />}
                  </small>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;

        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  if (!term.current) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <SearchIcon24 className="w-10 h-10 text-vault-600 mb-3" />
      <p className="text-chrome-400 text-sm">
        No results found for{' '}
        <span className="text-chrome-200 font-medium">
          &ldquo;{term.current}&rdquo;
        </span>
      </p>
    </div>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
