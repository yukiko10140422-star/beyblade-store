import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {SearchIcon24} from '~/components/icons';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="font-heading text-lg text-gold-metallic uppercase tracking-wider mb-4">
        Articles
      </h2>
      <div className="space-y-2">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div
              className="bg-vault-800 border border-vault-700 rounded-lg p-4 transition-all duration-200 hover:border-gold-400/30"
              key={article.id}
            >
              <Link
                prefetch="intent"
                to={articleUrl}
                className="text-gold-500 hover:text-gold-400 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 rounded"
              >
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="font-heading text-lg text-gold-metallic uppercase tracking-wider mb-4">
        Pages
      </h2>
      <div className="space-y-2">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div
              className="bg-vault-800 border border-vault-700 rounded-lg p-4 transition-all duration-200 hover:border-gold-400/30"
              key={page.id}
            >
              <Link
                prefetch="intent"
                to={pageUrl}
                className="text-gold-500 hover:text-gold-400 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 rounded"
              >
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="font-heading text-lg text-gold-metallic uppercase tracking-wider mb-4">
        Products
      </h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <div
                className="group bg-vault-800 border border-vault-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gold-400/30"
                key={product.id}
              >
                <Link
                  prefetch="intent"
                  to={productUrl}
                  className="flex items-center gap-4 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 rounded-lg"
                >
                  {image && (
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-vault-900">
                      <Image
                        data={image}
                        alt={product.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-chrome-200 text-sm font-medium truncate group-hover:text-gold-400 transition-colors">
                      {product.title}
                    </p>
                    <small className="text-gold-400 font-heading text-xs">
                      {price && <Money data={price} />}
                    </small>
                  </div>
                </Link>
              </div>
            );
          });

          return (
            <div className="space-y-4">
              <div>
                <PreviousLink className="inline-flex items-center gap-2 px-4 py-2 bg-vault-800 border border-vault-700 rounded-lg text-chrome-300 text-sm font-heading uppercase tracking-wider hover:border-gold-400/30 hover:text-gold-400 transition-all">
                  {isLoading ? (
                    <span className="text-chrome-500">Loading...</span>
                  ) : (
                    <span>&#8593; Load previous</span>
                  )}
                </PreviousLink>
              </div>
              <div className="grid gap-2">{ItemsMarkup}</div>
              <div>
                <NextLink className="inline-flex items-center gap-2 px-4 py-2 bg-vault-800 border border-vault-700 rounded-lg text-chrome-300 text-sm font-heading uppercase tracking-wider hover:border-gold-400/30 hover:text-gold-400 transition-all">
                  {isLoading ? (
                    <span className="text-chrome-500">Loading...</span>
                  ) : (
                    <span>Load more &#8595;</span>
                  )}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchIcon24 className="w-12 h-12 text-vault-600 mb-4" />
      <p className="text-chrome-400 text-sm">
        No results, try a different search.
      </p>
    </div>
  );
}
