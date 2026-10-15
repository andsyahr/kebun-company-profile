import type { APIRoute } from 'astro';
import { listPublishedNews } from '../lib/news';
import { LANGS } from '../i18n/ui';

export const prerender = false;

const SITE = 'https://kebun.tech';

// Sitemap dinamis untuk artikel berita (halaman SSR → tidak masuk sitemap statis @astrojs/sitemap)
export const GET: APIRoute = async () => {
  const posts = await listPublishedNews('id', 1000);
  const urls = posts
    .map((p) => {
      const lastmod = p.publishedAt.toISOString().slice(0, 10);
      const alternates =
        LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}/news/${p.slug}/"/>`).join('') +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/ja/news/${p.slug}/"/>`;
      return `<url><loc>${SITE}/id/news/${p.slug}/</loc><lastmod>${lastmod}</lastmod>${alternates}</url>`;
    })
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
