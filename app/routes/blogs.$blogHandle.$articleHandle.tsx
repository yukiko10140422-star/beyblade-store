import {useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {SITE_URL} from '~/lib/constants';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SITE, blogLabel, isOwnBlog, normalizeHandle} from '~/lib/site';

/** Same default share image as the home page (articles have no image). */
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-home.png`;

export const meta: Route.MetaFunction = ({data}) => {
  const article = data?.article;
  if (!article) return [{title: `Not found | ${SITE.name}`}];
  const title = `${article.seo?.title?.trim() || article.title} | ${SITE.name}`;
  const description = article.seo?.description?.trim() || '';
  const url = `${SITE_URL}/blogs/${encodeURIComponent(data.blogHandle)}/${encodeURIComponent(article.handle)}`;
  const image = article.image?.url ?? DEFAULT_OG_IMAGE;
  return [
    {title},
    ...(description ? [{name: 'description', content: description}] : []),
    {property: 'og:title', content: title},
    ...(description
      ? [{property: 'og:description', content: description}]
      : []),
    {property: 'og:type', content: 'article'},
    {property: 'og:url', content: url},
    {property: 'og:image', content: image},
    {property: 'og:site_name', content: SITE.name},
    {property: 'article:published_time', content: article.publishedAt},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:image', content: image},
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        datePublished: article.publishedAt,
        mainEntityOfPage: url,
        image,
        publisher: {'@type': 'Organization', name: SITE.name, url: SITE_URL},
      },
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadCriticalData(args);
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const blogHandle = normalizeHandle(params.blogHandle);
  const articleHandle = normalizeHandle(params.articleHandle);

  // Shared store: only Spin's own blogs (allowlist in site.ts).
  if (!articleHandle || !blogHandle || !isOwnBlog(blogHandle)) {
    throw new Response('Not found', {status: 404});
  }

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {blogHandle, articleHandle},
    cache: context.storefront.CacheLong(),
  });

  if (!blog?.articleByHandle) {
    throw new Response('Not found', {status: 404});
  }

  // Handles are compared decoded + NFC, so a Japanese handle in the URL
  // (percent-encoded) never triggers a redirect to itself.
  redirectIfHandleIsLocalized(
    request,
    {handle: articleHandle, data: blog.articleByHandle},
    {handle: blogHandle, data: {handle: normalizeHandle(blog.handle)}},
  );

  return {
    article: blog.articleByHandle,
    blogHandle,
    blogTitle: blogLabel(blogHandle, blog.title),
  };
}

/**
 * Article body from Shopify (h2–h4, p, ul/ol, table, a). Descendant
 * selectors because the body is raw HTML; tables scroll sideways on narrow
 * screens instead of widening the page.
 */
const ARTICLE_BODY =
  'mt-8 text-[15px] leading-relaxed text-chrome-300 ' +
  '[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-chrome-200 ' +
  '[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-chrome-200 ' +
  '[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-chrome-200 ' +
  '[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 ' +
  '[&_strong]:font-semibold [&_strong]:text-chrome-200 [&_a]:text-holo-500 [&_a]:underline ' +
  '[&_table]:mb-6 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-sm ' +
  '[&_th]:border [&_th]:border-vault-700 [&_th]:bg-white [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-chrome-200 ' +
  '[&_td]:border [&_td]:border-vault-700 [&_td]:bg-white [&_td]:px-3 [&_td]:py-2 [&_td]:align-top ' +
  '[&_img]:my-6 [&_img]:rounded-[4px]';

export default function Article() {
  const {article, blogHandle, blogTitle} = useLoaderData<typeof loader>();
  const {title, image, contentHtml} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(article.publishedAt));

  return (
    <article className="mx-auto max-w-[820px] px-4 pb-14 pt-[18px] md:px-10">
      <Breadcrumbs
        className="mb-5"
        truncateLast
        items={[
          {label: 'Home', href: '/'},
          {label: blogTitle, href: `/blogs/${encodeURIComponent(blogHandle)}`},
          {label: title},
        ]}
      />
      <h1 className="m-0 text-[24px] font-bold leading-tight text-chrome-200 md:text-[30px]">
        {title}
      </h1>
      <p className="mb-0 mt-3 text-[13px] text-chrome-400">
        <time dateTime={article.publishedAt}>{publishedDate}</time>
      </p>
      {image && (
        <div className="mt-6 overflow-hidden rounded-[4px]">
          <Image data={image} sizes="90vw" loading="eager" className="w-full" />
        </div>
      )}
      <div
        className={ARTICLE_BODY}
        dangerouslySetInnerHTML={{__html: contentHtml}}
      />
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      title
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
