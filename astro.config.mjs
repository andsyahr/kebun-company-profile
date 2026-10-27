// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://kebun.tech',
  // Hybrid: halaman statis diprarender; route `prerender = false` (news, /api/*, sitemap-news) via Node
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      // Root "/" (redirect 302 per bahasa, bukan konten) dan /admin tidak untuk mesin pencari
      filter: (page) => page !== 'https://kebun.tech/' && !page.includes('/admin'),
      // Halaman indeks berita SSR → tidak terdeteksi otomatis, daftar manual.
      // Artikel individual ada di /sitemap-news.xml (dibuat dinamis dari Firestore).
      customPages: [
        'https://kebun.tech/id/news/',
        'https://kebun.tech/en/news/',
        'https://kebun.tech/ja/news/',
      ],
      // hreflang alternates di sitemap — melengkapi <link rel="alternate"> di <head>
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          id: 'id',
          en: 'en',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
