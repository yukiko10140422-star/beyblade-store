import type {Route} from './+types/[sitemap.xml]';

/**
 * Sitemap index pointing at the scoped sitemaps only (see
 * sitemap.$type.$page[.xml].tsx). getSitemapIndex() would list the whole
 * shared Shopify store.
 */
export function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${origin}/sitemap/products/1.xml</loc></sitemap>
  <sitemap><loc>${origin}/sitemap/collections/1.xml</loc></sitemap>
  <sitemap><loc>${origin}/sitemap/pages/1.xml</loc></sitemap>
  <sitemap><loc>${origin}/sitemap/blogs/1.xml</loc></sitemap>
</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
