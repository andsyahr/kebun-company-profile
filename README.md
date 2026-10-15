# kebun.tech — Website PT Kebun Teknologi Indonesia

Website perusahaan multibahasa (JA/ID/EN) dibangun dengan **Astro + Tailwind CSS v4**, output statis, siap deploy ke **Vercel**.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output ke dist/
npm run preview
```

## Deploy ke Vercel

Import folder `site/` sebagai project Vercel — framework Astro terdeteksi otomatis (`vercel.json` sudah menyertakan header cache & security). Tidak perlu adapter karena output statis.

## ⚠️ Placeholder yang harus diganti sebelum go-live

Cari string berikut di seluruh repo (find & replace):

| Placeholder | Isi dengan |
|---|---|
| `{{ALAMAT_TC_SOLO}}` | Alamat training center Solo (Sukoharjo) |
| `{{ALAMAT_TC_BEKASI}}` | Alamat training center Bekasi |
| `{{NO_TELEPON}}` | Nomor telepon kantor |

Sudah terisi (2026-07-03): alamat kantor pusat (Bekasi Town Square Blok I10-I11), izin P3MI `8120101 9920710004`, izin SO `2/718/HK.03.01/Ⅲ/2023`, izin LPK `569/01/DPMPTSP-PPJU`, email `business@kebun.tech`, WhatsApp `+62 819 0335 3533` (link `wa.me/6281903353533`).

Juga cari komentar:

- `<!-- GANTI DENGAN TESTIMONI ASLI -->` — testimoni alumni di `src/pages/[lang]/for-candidates/` dan komponen `TestimonialCard`
- `<!-- ARTIKEL PLACEHOLDER` — 3 artikel di `src/content/news/{ja,id,en}/`
- `FOTO PLACEHOLDER` — semua gambar di `src/assets/placeholders/*.svg`; ganti file dengan foto asli (nama file boleh tetap, atau update import di halaman terkait)

## Form kontak

`src/components/ContactForm.astro` POST ke `/api/contact` (belum ada backend).
**TODO:** ganti URL fetch dengan endpoint Formspree, atau tambahkan serverless function Vercel + Resend. Cari komentar `TODO` di file tersebut.

## Logo & brand

- Logo resmi PT KTI: `src/assets/logo-kti.png` (transparan) + `src/assets/logo-kti-emblem.png` (emblem saja) — diekstrak dari `202605_会社説明.pptx` (media `image3.png`, 407×102). Jika tersedia file master (AI/SVG) resolusi lebih tinggi, ganti kedua file ini + `public/favicon.png`, `public/apple-touch-icon.png`, `public/og-image.png`.
- Token warna `garden-*` diselaraskan dengan gradasi emblem logo (#024256 → #095e76 → #71aebd), lihat `src/styles/global.css`.

## Struktur

- `src/i18n/ui.ts` — string UI bersama (nav, footer, CTA) per bahasa
- Copy per halaman ada di masing-masing file `src/pages/[lang]/**/index.astro` (objek `t` dengan kunci `ja/id/en`)
- `src/content/news/{ja,id,en}/*.md` — artikel (content collection)
- `src/styles/global.css` — semua token warna & tipografi (`@theme`)
- Signature motif "bridge arc": `src/components/BridgeArc.astro`

## SEO

- Meta title/description per halaman per bahasa, canonical, hreflang (ja/id/en + x-default), OG tags: `src/layouts/BaseLayout.astro`
- Sitemap: `@astrojs/sitemap` → `dist/sitemap-index.xml` (sudah dirujuk `public/robots.txt`)
- JSON-LD: `Organization` di semua halaman; `EmploymentAgency` (subtipe LocalBusiness) di halaman company & contact; `Article` di halaman berita
- Root `/` redirect berdasarkan bahasa browser (default `/ja/`), `noindex`
