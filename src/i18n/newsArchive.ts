import type { Lang } from './ui';

/** Jumlah artikel per halaman arsip publik (mobile-first: ~2 layar HP). */
export const NEWS_PAGE_SIZE = 4;

export interface NewsArchiveText {
  meta: { title: string; description: string };
  title: string;
  lead: string;
  empty: string;
  categories: Record<'news' | 'column' | 'update', string>;
  pager: {
    aria: string;
    prev: string;
    next: string;
    info: (total: number, page: number, totalPages: number) => string;
    titleSuffix: (page: number) => string;
  };
}

export const newsArchiveT: Record<Lang, NewsArchiveText> = {
  ja: {
    meta: {
      title: 'ニュース・コラム',
      description:
        'PT Kebun Teknologi Indonesiaからのお知らせと、特定技能・育成就労・インドネシア人材に関するコラムをお届けします。',
    },
    title: 'ニュース・コラム',
    lead: '制度の最新情報から現場のノウハウまで、日イ人材の「いま」を発信します。',
    empty: '記事はまだありません。',
    categories: { news: 'ニュース', column: 'コラム', update: 'お知らせ' },
    pager: {
      aria: 'ページナビゲーション',
      prev: '前へ',
      next: '次へ',
      info: (total, page, totalPages) => `${total}件の記事 · ${page} / ${totalPages}ページ`,
      titleSuffix: (page) => `ニュース・コラム — ${page}ページ目`,
    },
  },
  id: {
    meta: {
      title: 'Berita & Artikel',
      description:
        'Berita terbaru dan artikel seputar kerja di Jepang: program SSW, Ikusei Shuro, tips persiapan, dan info dari PT Kebun Teknologi Indonesia.',
    },
    title: 'Berita & Artikel',
    lead: 'Info terbaru seputar kerja di Jepang — regulasi, tips, dan kabar dari Kebun.',
    empty: 'Belum ada artikel.',
    categories: { news: 'Berita', column: 'Artikel', update: 'Info' },
    pager: {
      aria: 'Navigasi halaman',
      prev: 'Sebelumnya',
      next: 'Berikutnya',
      info: (total, page, totalPages) => `${total} artikel · Halaman ${page} dari ${totalPages}`,
      titleSuffix: (page) => `Berita & Artikel — Halaman ${page}`,
    },
  },
  en: {
    meta: {
      title: 'News & Articles',
      description:
        'News and articles from PT Kebun Teknologi Indonesia on SSW, Ikusei Shuro and Indonesian talent for Japan.',
    },
    title: 'News & Articles',
    lead: 'Updates on regulations, practical know-how, and news from Kebun.',
    empty: 'No articles yet.',
    categories: { news: 'News', column: 'Column', update: 'Update' },
    pager: {
      aria: 'Pagination',
      prev: 'Previous',
      next: 'Next',
      info: (total, page, totalPages) => `${total} articles · Page ${page} of ${totalPages}`,
      titleSuffix: (page) => `News & Articles — Page ${page}`,
    },
  },
};
