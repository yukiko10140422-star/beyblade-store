import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {SITE_URL} from '~/lib/constants';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SITE, blogLabel, isOwnBlog, normalizeHandle} from '~/lib/site';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: `Not found | ${SITE.name}`}];
  const title = `${data.blogTitle} | ${SITE.name}`;
  const description = `Articles about Beyblade X from ${SITE.name}.`;
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: 'website'},
    {
      property: 'og:url',
      content: `${SITE_URL}/blogs/${encodeURIComponent(data.blog.handle)}`,
    },
    {property: 'og:image', content: `${SITE_URL}/images/og-home.png`},
    {property: 'og:site_name', content: SITE.name},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const blogHandle = normalizeHandle(params.blogHandle);
  // Shared store: only Spin's own blogs (allowlist in site.ts).
  if (!blogHandle || !isOwnBlog(blogHandle)) {
    throw new Response('Not found', {status: 404});
  }

  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const {blog} = await context.storefront.query(BLOGS_QUERY, {
    variables: {blogHandle, ...paginationVariables},
    cache: context.storefront.CacheShort(),
  });

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {
    handle: blogHandle,
    data: {handle: normalizeHandle(blog.handle)},
  });

  return {
    blog: {...blog, handle: normalizeHandle(blog.handle)},
    blogTitle: blogLabel(blogHandle, blog.title),
  };
}

export default function Blog() {
  const {blog, blogTitle} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-14 pt-[18px] md:px-10">
      <Breadcrumbs
        className="mb-5"
        items={[{label: 'Home', href: '/'}, {label: blogTitle}]}
      />
      <h1 className="m-0 text-[24px] font-bold text-chrome-200 md:text-[30px]">
        {blogTitle}
      </h1>
      <div className="mt-8">
        <PaginatedResourceSection<ArticleItemFragment>
          connection={blog.articles}
          resourcesClassName="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {({node: article}) => (
            <ArticleItem
              article={article}
              blogHandle={blog.handle}
              key={article.id}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ArticleItem({
  article,
  blogHandle,
}: {
  article: ArticleItemFragment;
  blogHandle: string;
}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(article.publishedAt));
  const summary = article.seo?.description?.trim();
  return (
    <Link
      to={`/blogs/${encodeURIComponent(blogHandle)}/${encodeURIComponent(article.handle)}`}
      prefetch="intent"
      className="surface-vault group flex h-full flex-col rounded-[4px] p-5 transition-colors hover:border-chrome-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-holo-500"
    >
      <h2 className="m-0 text-base font-bold leading-snug text-chrome-200 group-hover:underline">
        {article.title}
      </h2>
      {summary && (
        <p className="mb-0 mt-2 text-sm leading-relaxed text-chrome-400">
          {summary}
        </p>
      )}
      <p className="mb-0 mt-auto pt-4 text-[13px] text-chrome-400">
        <time dateTime={article.publishedAt}>{publishedAt}</time>
      </p>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    handle
    id
    publishedAt
    title
    seo {
      description
    }
  }
` as const;
