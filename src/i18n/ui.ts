export const LANGS = ['ja', 'id', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'ja';

export const langNames: Record<Lang, string> = {
  ja: '日本語',
  id: 'Indonesia',
  en: 'English',
};

export const ogLocales: Record<Lang, string> = {
  ja: 'ja_JP',
  id: 'id_ID',
  en: 'en_US',
};

export const dateLocales: Record<Lang, string> = {
  ja: 'ja-JP',
  id: 'id-ID',
  en: 'en-US',
};

/** getStaticPaths untuk semua halaman [lang] */
export function getStaticLangPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export function isLang(value: string | undefined): value is Lang {
  return LANGS.includes(value as Lang);
}

/* ------------------------------------------------------------------
   String UI bersama (nav, footer, CTA umum).
   Copy per halaman didefinisikan di masing-masing file halaman.
   ------------------------------------------------------------------ */
export const ui = {
  ja: {
    siteName: 'PT Kebun Teknologi Indonesia',
    siteTagline: 'インドネシアと日本を、人でつなぐ。',
    nav: {
      company: '会社概要',
      services: 'サービス',
      forCompanies: '企業の皆さまへ',
      forCandidates: '求職者の方へ',
      training: 'トレーニング',
      news: 'ニュース',
      contact: 'お問い合わせ',
    },
    cta: {
      header: '無料相談',
      consult: '無料相談はこちら',
      apply: '応募・登録はこちら',
      contact: 'お問い合わせ',
      readMore: '詳しく見る',
      viewAll: '一覧を見る',
    },
    footer: {
      description:
        'インドネシア政府認定の送り出し機関（P3MI）として、特定技能・育成就労・技能実習に対応した人材紹介と、インドネシア・日本間のビジネスコンサルティングを提供しています。',
      licenseTitle: 'ライセンス',
      licenseP3MI: 'P3MI認定（インドネシア労働省）：8120101 9920710004',
      licenseSO: '送出機関（SO）認定：2/718/HK.03.01/Ⅲ/2023',
      licenseGroupJp: 'グループ（日本側）：有料職業紹介・登録支援機関',
      groupTitle: 'グループ会社',
      groupAnc: '株式会社ANCジャパン（名古屋）',
      contactTitle: '連絡先',
      rights: 'All rights reserved.',
      sitemap: 'サイトマップ',
    },
    misc: {
      menuOpen: 'メニューを開く',
      menuClose: 'メニューを閉じる',
      langSwitch: '言語を選択',
      backToNews: 'ニュース一覧へ戻る',
      publishedOn: '公開日',
      breadcrumbHome: 'ホーム',
    },
  },
  id: {
    siteName: 'PT Kebun Teknologi Indonesia',
    siteTagline: 'Menghubungkan Indonesia dan Jepang, lewat manusia.',
    nav: {
      company: 'Tentang Kami',
      services: 'Layanan',
      forCompanies: 'Untuk Perusahaan',
      forCandidates: 'Untuk Kandidat',
      training: 'Training Center',
      news: 'Berita',
      contact: 'Kontak',
    },
    cta: {
      header: 'Daftar Sekarang',
      consult: 'Konsultasi Gratis',
      apply: 'Daftar Sekarang',
      contact: 'Hubungi Kami',
      readMore: 'Selengkapnya',
      viewAll: 'Lihat Semua',
    },
    footer: {
      description:
        'P3MI berizin resmi Kementerian Ketenagakerjaan RI dan lembaga penyalur (送り出し機関) untuk program Tokutei Ginou (SSW), Ikusei Shuro, dan magang teknis ke Jepang — plus konsultasi bisnis Indonesia–Jepang.',
      licenseTitle: 'Legalitas',
      licenseP3MI: 'Izin P3MI (Kemnaker RI): 8120101 9920710004',
      licenseSO: 'Izin SO / Sending Organization (送出機関): 2/718/HK.03.01/Ⅲ/2023',
      licenseGroupJp: 'Grup (sisi Jepang): 有料職業紹介 & 登録支援機関',
      groupTitle: 'Grup Perusahaan',
      groupAnc: 'ANC Japan Co., Ltd. (Nagoya)',
      contactTitle: 'Kontak',
      rights: 'Hak cipta dilindungi.',
      sitemap: 'Peta Situs',
    },
    misc: {
      menuOpen: 'Buka menu',
      menuClose: 'Tutup menu',
      langSwitch: 'Pilih bahasa',
      backToNews: 'Kembali ke daftar berita',
      publishedOn: 'Dipublikasikan',
      breadcrumbHome: 'Beranda',
    },
  },
  en: {
    siteName: 'PT Kebun Teknologi Indonesia',
    siteTagline: 'Connecting Indonesia and Japan, through people.',
    nav: {
      company: 'Company',
      services: 'Services',
      forCompanies: 'For Companies',
      forCandidates: 'For Candidates',
      training: 'Training',
      news: 'News',
      contact: 'Contact',
    },
    cta: {
      header: 'Contact Us',
      consult: 'Free Consultation',
      apply: 'Apply Now',
      contact: 'Contact Us',
      readMore: 'Read more',
      viewAll: 'View all',
    },
    footer: {
      description:
        'Licensed Indonesian overseas placement company (P3MI) and sending organization for Japan’s SSW, Ikusei Shuro and technical intern programs, plus Indonesia–Japan business consulting.',
      licenseTitle: 'Licenses',
      licenseP3MI: 'P3MI license (Ministry of Manpower RI): 8120101 9920710004',
      licenseSO: 'Sending organization (SO) accreditation: 2/718/HK.03.01/Ⅲ/2023',
      licenseGroupJp: 'Group (Japan side): licensed paid job placement & registered support organization',
      groupTitle: 'Group Company',
      groupAnc: 'ANC Japan Co., Ltd. (Nagoya)',
      contactTitle: 'Contact',
      rights: 'All rights reserved.',
      sitemap: 'Sitemap',
    },
    misc: {
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      langSwitch: 'Select language',
      backToNews: 'Back to news',
      publishedOn: 'Published',
      breadcrumbHome: 'Home',
    },
  },
} as const;

export function useUI(lang: Lang) {
  return ui[lang];
}
