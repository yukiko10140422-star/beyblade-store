import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {SITE, blogLabel, isOwnBlog, normalizeHandle} from '~/lib/site';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [
    {title: `Articles | ${SITE.name}`},
    {name: 'description', content: `Articles about Beyblade X from ${SITE.name}.`},
  ];
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
      cache: context.storefront.CacheShort(),
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // Shared store: only Spin's own blogs (allowlist in site.ts).
  const own = blogs.nodes
    .filter((b) => isOwnBlog(b.handle))
    .map((b) => ({
      ...b,
      handle: normalizeHandle(b.handle),
      title: blogLabel(b.handle, b.title),
    }));
  if (!own.length) {
    throw new Response('Not found', {status: 404});
  }
  return {blogs: {...blogs, nodes: own}};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-[820px] px-4 pb-14 pt-[18px] md:px-10">
      <Breadcrumbs
        className="mb-5"
        items={[{label: 'Home', href: '/'}, {label: 'Articles'}]}
      />
      <h1 className="m-0 text-[24px] font-bold text-chrome-200 md:text-[30px]">
        Articles
      </h1>
      <div className="mt-8">
        <PaginatedResourceSection<BlogNode>
          connection={blogs}
          resourcesClassName="grid gap-4"
        >
          {({node: blog}) => (
            <Link
              key={blog.handle}
              prefetch="intent"
              to={`/blogs/${encodeURIComponent(blog.handle)}`}
              className="surface-vault block rounded-[4px] p-5 transition-colors hover:border-chrome-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-holo-500"
            >
              <h2 className="m-0 text-base font-bold text-chrome-200">
                {blog.title}
              </h2>
            </Link>
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
