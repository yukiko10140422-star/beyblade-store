import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: (args: {node: NodesType; index: number}) => React.ReactNode;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink>
              {isLoading ? (
                <span className="flex justify-center py-4 text-chrome-500 text-sm">
                  Loading...
                </span>
              ) : (
                <button className="w-full py-3 mb-8 text-center font-heading text-xs text-silver-500 hover:text-silver-400 border border-vault-700 hover:border-silver-400/30 rounded-[4px] transition-all">
                  <span aria-hidden="true">&uarr;</span> Load Previous
                </button>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink>
              {isLoading ? (
                <span className="flex justify-center py-4 text-chrome-500 text-sm">
                  Loading...
                </span>
              ) : (
                <button className="w-full py-3 mt-8 text-center font-heading text-xs text-silver-500 hover:text-silver-400 border border-vault-700 hover:border-silver-400/30 rounded-[4px] transition-all">
                  Load More <span aria-hidden="true">&darr;</span>
                </button>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
