import type { APIRoute } from 'astro';
import { sanity } from '../lib/sanity';

const BASE = 'https://www.adambarnes.biz';

// Static pages with their hand-tuned priorities (preview-domarn-infographic is
// intentionally excluded). Blog posts are appended dynamically from Sanity.
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'monthly' },
  { loc: '/web-design.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/seo-geo.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/photography.html', priority: '0.9', changefreq: 'monthly' },
  { loc: '/blog.html', priority: '0.8', changefreq: 'weekly' },
  { loc: '/contact.html', priority: '0.8', changefreq: 'yearly' },
  { loc: '/clients.html', priority: '0.7', changefreq: 'monthly' },
  { loc: '/about.html', priority: '0.7', changefreq: 'yearly' },
  { loc: '/faq.html', priority: '0.7', changefreq: 'monthly' },
  { loc: '/case-study-adambarnes-biz.html', priority: '0.7', changefreq: 'yearly' },
  { loc: '/case-study-adambarnesphotos.html', priority: '0.7', changefreq: 'yearly' },
  { loc: '/case-study-gardner-denley.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-uk-director-magazine.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-domarn-group.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-macro-advisory.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-boat-hire-norwich.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-firstlight-festival.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/case-study-tom-appleton.html', priority: '0.6', changefreq: 'yearly' },
  { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
];

type Entry = { loc: string; priority: string; changefreq: string; lastmod?: string };

export const GET: APIRoute = async () => {
  const posts: { slug: string; _updatedAt: string }[] = await sanity.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
      "slug": slug.current, _updatedAt
    }`,
  );

  const entries: Entry[] = [
    ...staticPages.map((p) => ({ loc: BASE + p.loc, priority: p.priority, changefreq: p.changefreq })),
    ...posts.map((p) => ({
      loc: `${BASE}/blog/${p.slug}.html`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: p._updatedAt,
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (e) =>
          `  <url>\n    <loc>${e.loc}</loc>\n` +
          (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
          `    <priority>${e.priority}</priority>\n    <changefreq>${e.changefreq}</changefreq>\n  </url>`,
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
