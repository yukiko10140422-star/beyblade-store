import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.page.title ?? ''} | Tokyo Spin Vault`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return criticalData;
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
      cache: context.storefront.CacheLong(),
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="font-heading text-2xl md:text-3xl text-gold-metallic uppercase tracking-wider mb-8">
        {page.title}
      </h1>
      <div
        className="text-chrome-400 text-sm leading-relaxed [&>p]:mb-4 [&>h2]:font-heading [&>h2]:text-lg [&>h2]:text-chrome-200 [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:font-heading [&>h3]:text-base [&>h3]:text-chrome-200 [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&_a]:text-gold-400 [&_a]:underline"
        dangerouslySetInnerHTML={{__html: page.body}}
      />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
