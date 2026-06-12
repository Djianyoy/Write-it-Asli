# Panduan Lengkap: Migrasi ke Neon (PostgreSQL) + Deploy ke Vercel

Project ini sekarang menggunakan **PostgreSQL (Neon)** via **Prisma ORM**, menggantikan JSON file storage. Setup ini full-compatible dengan Vercel karena Neon adalah database serverless yang persist (tidak hilang antar request).

---

## 1. Mengapa harus ganti dari JSON file?

Di Vercel, setiap request bisa dijalankan di instance serverless yang berbeda dan filesystem-nya **read-only** serta **ephemeral** (sementara). Artinya:
- Tulisan ke `src/data/articles.json` tidak akan tersimpan permanen
- Bisa hilang kapan saja saat instance di-restart/redeploy
- Tidak bisa di-share antar request/instance

Solusi: gunakan database eksternal yang persist. Neon dipilih karena:
- Gratis (free tier 0.5 GB storage, cukup untuk project skala kecil-menengah)
- PostgreSQL standar (banyak dokumentasi & tooling)
- Integrasi 1-klik dengan Vercel
- Prisma ORM membuat query type-safe dengan TypeScript

---

## 2. Struktur yang Berubah

```
prisma/
├── schema.prisma     # Definisi model database (User, Article, Clap, Bookmark, Follow)
└── seed.ts           # Script untuk mengisi data awal/dummy

src/
├── lib/
│   └── prisma.ts     # Prisma Client singleton (pengganti lib/db.ts)
├── features/articles/utils/
│   └── serializers.ts # Helper untuk ubah hasil query Prisma -> JSON aman untuk frontend
└── app/api/...        # Semua API routes sekarang query ke Prisma, bukan baca/tulis JSON

.env.example          # Template environment variables
```

`src/data/*.json` sudah dihapus — tidak dipakai lagi.

### Model Database (prisma/schema.prisma)

| Model | Keterangan |
|---|---|
| `User` | Data user: username, email, password, nama, bio, avatar |
| `Article` | Artikel: title, content, tags (array), status (published/draft) |
| `Clap` | Junction table — siapa nge-clap artikel apa (unique per user+artikel) |
| `Bookmark` | Junction table — siapa bookmark artikel apa |
| `Follow` | Junction table — siapa follow siapa (self-relation pada User) |

---

## 3. Setup Database di Neon

### a. Buat akun & project

1. Buka **https://neon.tech** dan daftar/login (bisa pakai akun GitHub)
2. Klik **Create a project**
3. Pilih nama project (misal `medium-clone`) dan region terdekat (misal Singapore)
4. Klik **Create project**

### b. Ambil connection string

Setelah project dibuat, Neon akan menampilkan **Connection Details**. Ada 2 jenis koneksi yang dibutuhkan:

1. **Pooled connection** (untuk `DATABASE_URL`) — digunakan aplikasi saat runtime, mendukung banyak koneksi serverless sekaligus
2. **Direct connection** (untuk `DIRECT_URL`) — digunakan oleh Prisma saat migrasi schema

Di dashboard Neon:
- Cari toggle **"Pooled connection"** — copy string ini untuk `DATABASE_URL`
- Matikan toggle tersebut (atau cari opsi "Direct connection") — copy string ini untuk `DIRECT_URL`

Formatnya kira-kira:
```
postgresql://USER:PASSWORD@ep-xxxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
postgresql://USER:PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

(yang ada `-pooler` di hostname = pooled, untuk `DATABASE_URL`)

---

## 4. Setup Lokal

### a. Install dependencies

```bash
cd medium-clone
npm install
```

Ini akan otomatis menjalankan `prisma generate` lewat `postinstall` script.

### b. Buat file `.env`

```bash
cp .env.example .env
```

Lalu edit `.env` dan isi dengan connection string dari Neon:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

> **Penting**: tambahkan `&pgbouncer=true&connect_timeout=15` di akhir `DATABASE_URL` (untuk pooled connection) supaya Prisma bekerja dengan baik dengan connection pooler Neon.

### c. Push schema ke database

Karena ini project baru tanpa migration history, gunakan `db push` (lebih simpel daripada `migrate`):

```bash
npm run db:push
```

Command ini akan membuat semua tabel (`users`, `articles`, `claps`, `bookmarks`, `follows`) sesuai `prisma/schema.prisma` langsung di database Neon.

> Alternatif: jika ingin proper migration history (untuk tim/production yang lebih serius), gunakan:
> ```bash
> npx prisma migrate dev --name init
> ```

### d. Isi data awal (seed)

```bash
npm run db:seed
```

Ini akan membuat 3 user demo dan 5 artikel contoh (sama seperti data dummy sebelumnya).

### e. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` — sekarang semua data dibaca/ditulis ke Neon Postgres.

### f. (Opsional) Buka Prisma Studio

Untuk melihat/edit data lewat GUI:

```bash
npm run db:studio
```

Akan terbuka di `http://localhost:5555`.

---

## 5. Deploy ke Vercel

### Opsi A — Via Vercel Dashboard + Neon Integration (paling mudah)

1. Push project ke GitHub (repo baru)
2. Buka **https://vercel.com** → login → **Add New Project**
3. Import repo GitHub kamu
4. Sebelum klik Deploy, buka tab **"Storage"** di project Vercel (atau setelah deploy pertama, ke Project Settings → Storage)
5. Klik **Connect Database** → pilih **Neon** → ikuti wizard untuk connect/buat database baru
   - Vercel akan otomatis mengisi environment variable `DATABASE_URL` dan `DIRECT_URL` (atau nama mirip `POSTGRES_URL` — sesuaikan nama variable di kode jika berbeda)
6. Klik **Deploy**

Setelah deploy pertama biasanya gagal kalau tabel belum ada. Lanjut ke langkah migrasi database production di bawah.

### Opsi B — Manual (Neon project sendiri + Environment Variables manual)

1. Push project ke GitHub
2. Buka Vercel → **Add New Project** → import repo
3. Di langkah **Configure Project**, buka **Environment Variables** dan tambahkan:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | pooled connection string dari Neon |
   | `DIRECT_URL` | direct connection string dari Neon |

4. Klik **Deploy**

### Build Command

Pastikan **Build Command** di Vercel adalah:
```
prisma generate && next build
```

Ini sudah otomatis terkonfigurasi lewat `package.json` (`"build": "prisma generate && next build"`), jadi biasanya tidak perlu diubah manual. Tapi jika Vercel meng-override, cek di **Project Settings → General → Build & Development Settings**.

---

## 6. Push Schema & Seed ke Database Production

Setelah environment variable production sudah benar, jalankan migrasi schema **dari local** tapi mengarah ke database production Neon:

### Cara 1: Pakai Vercel CLI (recommended)

```bash
npm i -g vercel
vercel login
vercel link            # hubungkan folder project ke project Vercel
vercel env pull .env.production.local   # tarik env vars dari Vercel ke file lokal
```

Lalu jalankan push & seed dengan env tersebut:

```bash
npx dotenv -e .env.production.local -- npx prisma db push
npx dotenv -e .env.production.local -- npx tsx prisma/seed.ts
```

(Jika `dotenv` belum ada: `npm i -D dotenv-cli`)

### Cara 2: Manual

Sementara ganti isi `.env` lokal dengan connection string **production** Neon, lalu:

```bash
npm run db:push
npm run db:seed
```

Setelah selesai, kembalikan `.env` ke connection string development (jika kamu pakai database Neon yang berbeda untuk dev/prod — disarankan, lihat poin berikutnya).

---

## 7. Rekomendasi: Pisahkan Database Dev & Production

Di Neon, kamu bisa membuat **branch database** (fitur khas Neon, seperti Git branch tapi untuk database):

1. Di Neon dashboard → pilih project → tab **Branches**
2. Klik **Create branch** → beri nama misalnya `development` (cabang dari `main`/`production`)
3. Branch baru ini punya connection string sendiri — gunakan untuk `.env` lokal
4. Branch `main`/`production` tetap dipakai oleh Vercel (production deployment)

Dengan begini, eksperimen di local tidak akan merusak data production.

---

## 8. Catatan Keamanan untuk Production

Schema dan kode saat ini menyimpan password dalam **plain text** (sesuai project awal yang berbasis JSON mock). Untuk production sungguhan, **wajib** tambahkan hashing:

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Lalu di `src/app/api/auth/register/route.ts`:
```ts
import bcrypt from "bcryptjs";
// ...
const hashedPassword = await bcrypt.hash(password, 10);
// simpan hashedPassword, bukan password asli
```

Dan di `src/app/api/auth/login/route.ts`:
```ts
const isValid = await bcrypt.compare(password, user.password);
if (!user || !isValid) { /* error */ }
```

Selain itu, sistem auth saat ini berbasis localStorage tanpa session/JWT — untuk production sebaiknya pakai **NextAuth.js** atau **Lucia Auth** untuk session management yang aman.

---

## 9. Troubleshooting

**Error: "Can't reach database server"**
→ Cek apakah `DATABASE_URL` di Vercel sudah benar dan project Neon tidak dalam status "suspended" (Neon free tier auto-suspend setelah idle, tapi akan auto-wake saat ada koneksi — first request mungkin sedikit lambat).

**Error: "Prepared statement already exists" / connection pool error**
→ Pastikan `DATABASE_URL` menggunakan **pooled connection** (mengandung `-pooler` di hostname) dan ada parameter `?pgbouncer=true`.

**Build gagal: "Prisma has detected that this project was built on Vercel..."**
→ Ini warning normal, Prisma akan otomatis generate client. Pastikan `prisma generate` ada di build command.

**Data masih kosong setelah deploy**
→ Jalankan langkah 6 (push schema + seed) ke database production — `db push` tidak otomatis jalan saat deploy.

---

## Ringkasan Perintah

```bash
# Setup awal
cp .env.example .env          # isi dengan Neon connection string
npm install
npm run db:push                # buat tabel di database
npm run db:seed                # isi data contoh
npm run dev                     # jalankan dev server

# Setelah deploy ke Vercel (sekali saja / saat schema berubah)
vercel env pull .env.production.local
npx dotenv -e .env.production.local -- npx prisma db push
npx dotenv -e .env.production.local -- npx tsx prisma/seed.ts
```
