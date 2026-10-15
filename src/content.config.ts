import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Koleksi berita/artikel per bahasa.
 * Struktur: src/content/news/{ja|id|en}/slug.md
 * id entry = "ja/slug" → lang diambil dari segmen pertama.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['news', 'column', 'update']).default('news'),
  }),
});

export const collections = { news };
