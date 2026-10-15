import { collection, getDocs, query, where, type Timestamp } from 'firebase/firestore/lite';
import { getDb } from './firebase';

export interface NewsTranslation {
  title: string;
  description: string;
  body: string;
}

export interface NewsPost {
  id: string;
  slug: string;
  lang: string;
  category: 'news' | 'column' | 'update';
  title: string;
  description: string;
  body: string;
  publishedAt: Date;
  translations?: Partial<Record<'en' | 'ja', NewsTranslation>>;
}

type NewsDoc = Omit<NewsPost, 'id' | 'publishedAt'> & { publishedAt: Timestamp };

function toPost(id: string, d: NewsDoc): NewsPost {
  return { ...d, id, publishedAt: d.publishedAt?.toDate?.() ?? new Date(0) };
}

/** Pakai terjemahan untuk bahasa target kalau ada; fallback ke isi asli (Indonesia). */
function localized(p: NewsPost, lang: string): NewsPost {
  if (lang === 'id') return p;
  const t = p.translations?.[lang as 'en' | 'ja'];
  if (!t) return p;
  return { ...p, title: t.title, description: t.description, body: t.body };
}

/**
 * Semua artikel terbit (sumber Indonesia), terbaru dulu, dilokalkan ke `lang`.
 * Sort di JS agar tidak butuh composite index.
 */
export async function listPublishedNews(lang: string, max = 50): Promise<NewsPost[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'news'), where('published', '==', true));
    const snap = await getDocs(q);
    return snap.docs
      .map((doc) => localized(toPost(doc.id, doc.data() as NewsDoc), lang))
      .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf())
      .slice(0, max);
  } catch (err) {
    console.error('listPublishedNews failed:', err);
    return [];
  }
}

export async function getNewsBySlug(lang: string, slug: string): Promise<NewsPost | null> {
  const posts = await listPublishedNews(lang);
  return posts.find((p) => p.slug === slug) ?? null;
}
