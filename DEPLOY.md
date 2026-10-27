# Panduan Deploy — Website kebun.tech

Dokumen serah terima untuk tim IT. Website ini Astro + Tailwind, berjalan sebagai **container Docker** (`@astrojs/node` standalone) di VPS sendiri. Halaman statis diprarender; bagian dinamis — form kontak (`/api/contact`), halaman berita (SSR, baca Firestore), `/api/translate-news`, `/sitemap-news.xml` — dilayani proses Node dalam container.

## Arsitektur CI/CD

```
push ke main
  └─► GitHub Actions: docker build → push ghcr.io/<repo>/kebun-company-profile:latest (+ :<sha>)
  └─► GitHub Actions: SSH ke VPS → pull → ganti container `kebun-web`
        └─► Apache (SSL existing) ── proxy ──► 127.0.0.1:4321
```

File terkait: `Dockerfile`, `.dockerignore`, `.github/workflows/deploy.yml`.

## Sekali di GitHub — Secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Isi |
|---|---|
| `SSH_HOST` | IP/hostname VPS |
| `SSH_USER` | user SSH (harus bisa `docker` — masukkan ke group `docker`) |
| `SSH_KEY` | private key SSH user tsb. |
| `PUBLIC_FIREBASE_API_KEY` / `PUBLIC_FIREBASE_AUTH_DOMAIN` / `PUBLIC_FIREBASE_PROJECT_ID` / `PUBLIC_FIREBASE_APP_ID` | web config Firebase (publik by design, ter-inline saat build) |

**Package GHCR diset private** → VPS perlu autentikasi saat pull. Buat **Personal Access Token (classic)** di GitHub → Settings → Developer settings → Tokens → scope `read:packages` saja. Lalu **sekali di server**, sebagai user SSH yang sama dengan `SSH_USER`:

```bash
echo "<PAT>" | docker login ghcr.io -u <github-username> --password-stdin
```

Login tersimpan di `~/.docker/config.json` user tsb. dan dipakai semua pull berikutnya — termasuk yang dijalankan GitHub Actions via SSH. (Alternatif: simpan PAT di GitHub Secrets lalu login di dalam script deploy — lebih ribet, tidak perlu.)

## Sekali di server — setup awal

1. **Install Docker**: `curl -fsSL https://get.docker.com | sh` lalu `usermod -aG docker <user>`.
2. **Env runtime** di `/home/ubuntu/kebun.env` (`chmod 600`, jangan commit):
   ```
   AUTH_EMAIL=...
   AUTH_CLIENT_ID=...
   AUTH_CLIENT_SECRET=...
   AUTH_REFRESH_TOKEN=...
   CONTACT_TO=business@kebun.tech
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}   # JSON satu baris
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=ap-southeast-1
   ```
3. **Apache**: aktifkan modul `a2enmod proxy proxy_http headers`. Vhost `kebun.tech` (SSL existing dipakai ulang):
   ```apache
   <VirtualHost *:443>
     ServerName kebun.tech
     ServerAlias www.kebun.tech

     # ...SSLEngine + sertifikat existing (certbot) tetap...

     ProxyPreserveHost On
     ProxyPass / http://127.0.0.1:4321/
     ProxyPassReverse / http://127.0.0.1:4321/

     # Pengganti security headers vercel.json lama
     Header always set X-Content-Type-Options "nosniff"
     Header always set X-Frame-Options "DENY"
     Header always set Referrer-Policy "strict-origin-when-cross-origin"
     <Location "/_astro/">
       Header always set Cache-Control "public, max-age=31536000, immutable"
     </Location>
   </VirtualHost>
   ```
   Simpan vhost WordPress lama sebagai cadangan (mis. `wordpress.conf.disabled`) — rollback instan = tukar vhost + `systemctl reload apache2`.
4. **Container pertama** (selanjutnya otomatis oleh CI/CD):
   ```bash
   docker pull ghcr.io/<user>/kebun-company-profile:latest
   docker run -d --name kebun-web --restart unless-stopped \
     -p 127.0.0.1:4321:4321 --env-file /home/ubuntu/kebun.env \
     ghcr.io/<user>/kebun-company-profile:latest
   ```
5. Verifikasi: `curl -I http://127.0.0.1:4321/` → 200, lalu cek `https://kebun.tech`.

## Operasional

- **Deploy**: push ke `main` — sisanya otomatis. Pantau di tab Actions repo.
- **Rollback app**: `docker run` ulang tag SHA lama, mis. `ghcr.io/<user>/kebun-company-profile:<sha>`.
- **Rollback ke WordPress**: tukar kembali vhost Apache + reload.
- **Log**: `docker logs -f kebun-web`. Healthcheck container memeriksa `/` tiap 30 dtk.
- **Downtime**: ~beberapa detik saat container diganti (stop→rm→run). Normal untuk skala ini.
- ⚠️ **DNS**: domain sudah menunjuk ke server ini — jangan sentuh **MX record**, email `business@kebun.tech` bergantung padanya.

## Berita dinamis (Firebase)

Berita dikelola via halaman admin dan disimpan di **Cloud Firestore**:

1. **Buat project Firebase** di console.firebase.google.com → aktifkan **Cloud Firestore** (mode production) dan **Authentication → Email/Password**.
2. **Buat user admin** di Authentication → Users → Add user (email + password kuat). Hanya user ini yang bisa login ke halaman admin.
3. **Pasang security rules** — isi `firestore.rules` di repo ini disalin ke Firestore → Rules → Publish. Publik hanya bisa baca artikel `published: true`; tulis butuh login.
4. **Ambil web config** (Project settings → Your apps → Web app): `apiKey`, `authDomain`, `projectId`, `appId` → isi ke env `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID` (lokal di `.env`; di CI/CD jadi GitHub Secrets karena ter-inline saat build). Config ini memang publik by design — keamanan ada di rules + Auth, bukan kerahasiaan config.
5. **Halaman admin**: `/admin/berita`. Artikel ditulis dalam **bahasa Indonesia** (sumber); English & 日本語 dibuat otomatis via **AWS Translate** **hanya saat artikel pertama dibuat**. Edit berikutnya pada bahasa Indonesia tidak menerjemahkan ulang — tombol **"Terjemahkan ulang (EN & 日本語)"** di form menimpa EN/JA secara manual (ada konfirmasi, karena koreksi manual akan diganti). Semua artikel terbit tampil di ketiga versi bahasa situs.

**Terjemahan otomatis (AWS Translate)** — endpoint `/api/translate-news` (server-only, butuh env runtime):

1. **AWS**: buat IAM user khusus dengan policy `translate:TranslateText` saja (jangan root/full-access) → buat Access key → isi env `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (mis. `ap-southeast-1`). Biaya ~$15 per 1 juta karakter (±$0.06/artikel).
2. **Firebase service account**: Firebase Console → Project settings → Service accounts → Generate new private key → salin seluruh JSON (satu baris) ke env `FIREBASE_SERVICE_ACCOUNT`.
3. Endpoint memverifikasi Firebase ID token admin sebelum menerjemahkan — tanpa login admin, endpoint menolak.
4. Tanpa env ini artikel tetap bisa disimpan (bahasa Indonesia), hanya terjemahan otomatis yang nonaktif — tab EN/JA bisa diisi manual.

Catatan: file lama `src/content/news/*.md` tidak lagi dipakai — kontennya bisa dipindah manual lewat admin, lalu foldernya boleh dihapus.

## Form kontak

`src/pages/api/contact.ts` (nodemailer + Gmail OAuth2) mengirim ke `business@kebun.tech`. **Wajib env runtime** di `/home/ubuntu/kebun.env`: `AUTH_EMAIL`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `AUTH_REFRESH_TOKEN`, `CONTACT_TO`. ⚠️ OAuth app di Google Cloud Console harus berstatus **"In production"** — kalau masih "Testing", refresh token kedaluwarsa tiap 7 hari dan form diam-diam berhenti bekerja.

## Cara build lokal

Butuh Bun (atau Node 20+):

```bash
bun install
bun run build
```

Hasilnya di `dist/`. Pratinjau lokal: `bun run preview` (http://localhost:4321). Uji container lokal:

```bash
docker build -t kebun-web:test .
docker run --rm -p 4321:4321 kebun-web:test
```

Konten per halaman ada di `src/pages/[lang]/**/index.astro` (objek `t` berisi teks ja/id/en), warna & tipografi di `src/styles/global.css`.

## ⚠️ Sebelum go-live — hal yang belum selesai

1. **3 placeholder teks belum diisi** (cari string ini di `src/`): `{{NO_TELEPON}}`, `{{ALAMAT_TC_SOLO}}`, `{{ALAMAT_TC_BEKASI}}`.
2. **Foto masih placeholder** (`src/assets/placeholders/*.svg`) dan **testimoni bertanda** `<!-- GANTI DENGAN TESTIMONI ASLI -->` — ganti saat materi asli tersedia. Situs aman di-publish dengan placeholder ini, tapi lebih baik diganti segera.
3. **Backup/ekspor WordPress lama** sebelum vhost ditukar — setelah cutover, konten WordPress tidak lagi tampil di domain.

## SEO yang sudah terpasang (tidak perlu diubah)

Meta title/description per bahasa, canonical, hreflang (ja/id/en + x-default), Open Graph + `og-image.png`, `sitemap-index.xml` + `sitemap-news.xml` (artikel dinamis, dirujuk `robots.txt`), JSON-LD Organization/EmploymentAgency/Article. Setelah live, daftarkan `https://kebun.tech/sitemap-index.xml` di Google Search Console.
